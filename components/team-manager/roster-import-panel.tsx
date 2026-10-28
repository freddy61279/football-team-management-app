'use client'

import { useRef, useState, type ChangeEvent, type DragEvent } from 'react'
import { Download, FileSpreadsheet, Upload, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type {
  Player,
  PlayerAvailability,
  PlayerDraft,
  PlayerPosition,
  PreferredFoot,
} from './types'

const MAX_FILE_BYTES = 2 * 1024 * 1024
const MAX_IMPORT_ROWS = 100
const CSV_TEMPLATE = 'name,number,position,availability,preferredFoot,dateOfBirth,appearances,goals,assists,notes\n'

interface ParsedRosterRow {
  rowNumber: number
  name: string
  number: string
  position: string
  player: PlayerDraft | null
  error: string | null
}

interface ParseResult {
  rows: ParsedRosterRow[]
  error: string | null
}

interface Props {
  players: Player[]
  onImportPlayers: (players: PlayerDraft[]) => void
}

const headerAliases = {
  name: ['name', 'player', 'playername', 'fullname'],
  number: ['number', 'squadnumber', 'jerseynumber', 'shirtnumber', 'shirt'],
  position: ['position', 'primaryposition', 'role'],
  availability: ['availability', 'status'],
  preferredFoot: ['preferredfoot', 'foot'],
  dateOfBirth: ['dateofbirth', 'dob', 'birthdate'],
  appearances: ['appearances', 'apps', 'matches'],
  goals: ['goals'],
  assists: ['assists'],
  notes: ['notes', 'comment', 'comments'],
} as const

function normalize(value: string) {
  return value.trim().toLowerCase().replace(/[^a-z0-9]/g, '')
}

function splitCsvRows(source: string) {
  const text = source.replace(/^\uFEFF/, '')
  const rows: string[][] = []
  let row: string[] = []
  let field = ''
  let quoted = false

  for (let index = 0; index < text.length; index += 1) {
    const character = text[index]

    if (character === '"') {
      if (quoted && text[index + 1] === '"') {
        field += '"'
        index += 1
      } else {
        quoted = !quoted
      }
    } else if (character === ',' && !quoted) {
      row.push(field.trim())
      field = ''
    } else if ((character === '\n' || character === '\r') && !quoted) {
      row.push(field.trim())
      if (row.some((cell) => cell.length > 0)) rows.push(row)
      row = []
      field = ''
      if (character === '\r' && text[index + 1] === '\n') index += 1
    } else {
      field += character
    }
  }

  if (quoted) return { rows: [] as string[][], malformed: true }

  row.push(field.trim())
  if (row.some((cell) => cell.length > 0)) rows.push(row)
  return { rows, malformed: false }
}

function findColumn(headers: string[], aliases: readonly string[]) {
  return headers.findIndex((header) => aliases.includes(normalize(header)))
}

function parsePosition(value: string): PlayerPosition | null {
  const position = normalize(value)
  if (['gk', 'goalkeeper', 'keeper'].includes(position)) return 'Goalkeeper'
  if (['def', 'defender', 'defence', 'defense', 'cb', 'lcb', 'rcb', 'lb', 'rb', 'lwb', 'rwb', 'leftback', 'rightback', 'centerback', 'centreback'].includes(position)) return 'Defender'
  if (['mid', 'midfielder', 'midfield', 'cdm', 'dm', 'cm', 'cam', 'am', 'lm', 'rm', 'defensivemidfielder', 'centralmidfielder', 'attackingmidfielder'].includes(position)) return 'Midfielder'
  if (['fwd', 'fw', 'forward', 'striker', 'attacker', 'cf', 'ss', 'winger', 'lw', 'rw', 'leftwing', 'rightwing'].includes(position)) return 'Forward'
  return null
}

function parseAvailability(value: string): PlayerAvailability | null {
  const availability = normalize(value)
  if (!availability || ['available', 'fit'].includes(availability)) return 'Available'
  if (['injured', 'injury'].includes(availability)) return 'Injured'
  if (['unavailable', 'notavailable', 'out'].includes(availability)) return 'Unavailable'
  return null
}

function parsePreferredFoot(value: string): PreferredFoot | null {
  const foot = normalize(value)
  if (!foot || ['right', 'r'].includes(foot)) return 'Right'
  if (['left', 'l'].includes(foot)) return 'Left'
  if (['both', 'either'].includes(foot)) return 'Both'
  return null
}

function parseStatistic(value: string) {
  if (!value) return 0
  const statistic = Number(value)
  return Number.isInteger(statistic) && statistic >= 0 && statistic <= 1000 ? statistic : null
}

function isValidDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const date = new Date(`${value}T00:00:00.000Z`)
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value
}

function parseRosterCsv(text: string, currentPlayers: Player[]): ParseResult {
  const parsed = splitCsvRows(text)
  if (parsed.malformed) return { rows: [], error: 'A quoted field is incomplete. Check the CSV and try again.' }
  if (parsed.rows.length < 2) return { rows: [], error: 'Add a header row and at least one player to the CSV.' }

  const [headers, ...records] = parsed.rows
  const columns = {
    name: findColumn(headers, headerAliases.name),
    number: findColumn(headers, headerAliases.number),
    position: findColumn(headers, headerAliases.position),
    availability: findColumn(headers, headerAliases.availability),
    preferredFoot: findColumn(headers, headerAliases.preferredFoot),
    dateOfBirth: findColumn(headers, headerAliases.dateOfBirth),
    appearances: findColumn(headers, headerAliases.appearances),
    goals: findColumn(headers, headerAliases.goals),
    assists: findColumn(headers, headerAliases.assists),
    notes: findColumn(headers, headerAliases.notes),
  }

  if (columns.name < 0 || columns.number < 0 || columns.position < 0) {
    return { rows: [], error: 'Required columns are name, number, and position. Download the template for the full format.' }
  }
  if (records.length > MAX_IMPORT_ROWS) {
    return { rows: [], error: `This file has ${records.length} player rows. Import up to ${MAX_IMPORT_ROWS} players at a time.` }
  }

  const usedNumbers = new Set(currentPlayers.map((player) => player.number))
  const rows: ParsedRosterRow[] = []

  records.forEach((record, index) => {
    const value = (column: number) => (column < 0 ? '' : (record[column] ?? '').trim())
    const name = value(columns.name)
    const numberValue = value(columns.number)
    const positionValue = value(columns.position)
    const position = parsePosition(positionValue)
    const availabilityValue = value(columns.availability)
    const availability = parseAvailability(availabilityValue)
    const preferredFootValue = value(columns.preferredFoot)
    const preferredFoot = parsePreferredFoot(preferredFootValue)
    const dateOfBirth = value(columns.dateOfBirth)
    const appearances = parseStatistic(value(columns.appearances))
    const goals = parseStatistic(value(columns.goals))
    const assists = parseStatistic(value(columns.assists))
    const notes = value(columns.notes)
    const number = /^\d+$/.test(numberValue) ? Number(numberValue) : Number.NaN
    const errors: string[] = []

    if (!name) errors.push('Player name is required.')
    else if (name.length > 80) errors.push('Player name must be 80 characters or fewer.')
    if (!Number.isInteger(number) || number < 1 || number > 99) errors.push('Squad number must be between 1 and 99.')
    else if (usedNumbers.has(number)) errors.push(`Squad number ${number} is already in this roster or file.`)
    if (!position) errors.push('Use Goalkeeper, Defender, Midfielder, or Forward for position.')
    if (!availability) errors.push('Availability must be Available, Injured, or Unavailable.')
    if (!preferredFoot) errors.push('Preferred foot must be Right, Left, or Both.')
    if (dateOfBirth && !isValidDate(dateOfBirth)) errors.push('Date of birth must use YYYY-MM-DD.')
    if (appearances === null || goals === null || assists === null) errors.push('Stats must be whole numbers from 0 to 1,000.')
    if (notes.length > 500) errors.push('Notes must be 500 characters or fewer.')

    if (errors.length === 0 && position && availability && preferredFoot && appearances !== null && goals !== null && assists !== null) {
      usedNumbers.add(number)
      rows.push({
        rowNumber: index + 2,
        name,
        number: numberValue,
        position: positionValue,
        player: {
          name,
          number,
          position,
          availability,
          preferredFoot,
          dateOfBirth,
          appearances,
          goals,
          assists,
          notes,
        },
        error: null,
      })
    } else {
      rows.push({
        rowNumber: index + 2,
        name: name || 'Unnamed player',
        number: numberValue || '—',
        position: positionValue || '—',
        player: null,
        error: errors.join(' '),
      })
    }
  })

  return rows.length
    ? { rows, error: null }
    : { rows: [], error: 'No player rows were found in this CSV.' }
}

function formatFileSize(size: number) {
  return size < 1024 * 1024 ? `${Math.max(1, Math.round(size / 1024))} KB` : `${(size / (1024 * 1024)).toFixed(1)} MB`
}

export function RosterImportPanel({ players, onImportPlayers }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [fileName, setFileName] = useState('')
  const [fileSize, setFileSize] = useState(0)
  const [rows, setRows] = useState<ParsedRosterRow[]>([])
  const [fileError, setFileError] = useState('')
  const [isDragging, setIsDragging] = useState(false)

  const validRows = rows.filter((row) => row.player)
  const invalidRows = rows.filter((row) => row.error)

  async function readFile(file?: File) {
    if (!file) return
    setFileName(file.name)
    setFileSize(file.size)
    setRows([])
    setFileError('')

    if (!file.name.toLowerCase().endsWith('.csv')) {
      setFileError('Choose a CSV roster file. You can download the template below.')
      return
    }
    if (file.size > MAX_FILE_BYTES) {
      setFileError('This file is larger than 2 MB. Try a smaller roster CSV.')
      return
    }
    if (file.size === 0) {
      setFileError('This file is empty. Add a header row and player details, then try again.')
      return
    }

    try {
      const result = parseRosterCsv(await file.text(), players)
      setRows(result.rows)
      setFileError(result.error ?? '')
    } catch {
      setFileError('This file could not be read. Export it as a UTF-8 CSV and try again.')
    }
  }

  function handleInputChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.currentTarget.files?.[0]
    event.currentTarget.value = ''
    void readFile(file)
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault()
    setIsDragging(false)
    void readFile(event.dataTransfer.files[0])
  }

  function downloadTemplate() {
    const file = new Blob([CSV_TEMPLATE], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(file)
    const link = document.createElement('a')
    link.href = url
    link.download = 'touchline-roster-template.csv'
    link.click()
    window.setTimeout(() => URL.revokeObjectURL(url), 1000)
  }

  function clearFile() {
    setFileName('')
    setFileSize(0)
    setRows([])
    setFileError('')
  }

  function importValidPlayers() {
    const drafts = validRows.flatMap((row) => row.player ? [row.player] : [])
    if (drafts.length === 0) return
    onImportPlayers(drafts)
    clearFile()
  }

  return (
    <section className="content-card roster-import-card" aria-labelledby="roster-import-heading">
      <header className="roster-import-heading">
        <div className="roster-import-title-group">
          <span className="roster-import-icon" aria-hidden="true"><FileSpreadsheet /></span>
          <div>
            <p className="roster-import-kicker">BULK ROSTER IMPORT</p>
            <h3 id="roster-import-heading">Upload players from a document</h3>
            <p className="roster-import-description">Bring in a squad list at once, then review the details before adding them.</p>
          </div>
        </div>
        <Button type="button" variant="ghost" size="sm" onClick={downloadTemplate}>
          <Download data-icon="inline-start" aria-hidden="true" />
          Download CSV template
        </Button>
      </header>

      <div
        className={`roster-import-dropzone${isDragging ? ' roster-import-dropzone--active' : ''}`}
        onDragOver={(event) => {
          event.preventDefault()
          setIsDragging(true)
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
      >
        <span className="roster-import-upload-icon" aria-hidden="true"><Upload /></span>
        <div className="roster-import-dropzone-copy">
          <strong>Drop your roster CSV here</strong>
          <p>or browse your files to get started</p>
        </div>
        <div className="roster-import-dropzone-action">
          <Button type="button" variant="outline" size="sm" onClick={() => inputRef.current?.click()}>
            <Upload data-icon="inline-start" aria-hidden="true" />
            Choose file
          </Button>
          <span>CSV · up to 2 MB · 100 players</span>
        </div>
        <input
          ref={inputRef}
          className="sr-only"
          type="file"
          accept=".csv,text/csv"
          aria-label="Choose a roster CSV file"
          onChange={handleInputChange}
          tabIndex={-1}
        />
      </div>

      <p className="roster-import-format-note">
        Required columns: <strong>name, number, position</strong>. Optional columns include availability, preferred foot, birth date, stats, and notes.
      </p>

      {fileName ? (
        <div className="roster-import-file" aria-live="polite">
          <span className="roster-import-file-icon" aria-hidden="true"><FileSpreadsheet /></span>
          <span className="roster-import-file-copy">
            <strong>{fileName}</strong>
            <small>{formatFileSize(fileSize)}</small>
          </span>
          <Button type="button" variant="ghost" size="icon" aria-label="Remove uploaded roster file" onClick={clearFile}>
            <X data-icon aria-hidden="true" />
          </Button>
        </div>
      ) : null}

      {fileError ? <p className="roster-import-error" role="alert">{fileError}</p> : null}

      {rows.length > 0 ? (
        <div className="roster-import-preview">
          <div className="roster-import-preview-heading">
            <div>
              <h4>Review players</h4>
              <p>{validRows.length} ready to add{invalidRows.length ? ` · ${invalidRows.length} need attention` : ''}</p>
            </div>
            <span className="roster-import-preview-count">{rows.length} rows</span>
          </div>
          <div className="roster-import-table-wrap" role="region" aria-label="Player import preview" tabIndex={0}>
            <table className="roster-import-table">
              <thead>
                <tr>
                  <th scope="col">Player</th>
                  <th scope="col">No.</th>
                  <th scope="col">Position</th>
                  <th scope="col">Review</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.rowNumber}>
                    <td>{row.name}</td>
                    <td>{row.number}</td>
                    <td>{row.position}</td>
                    <td>
                      {row.error ? (
                        <span className="roster-import-row-status roster-import-row-status--error" title={row.error}>Needs attention</span>
                      ) : (
                        <span className="roster-import-row-status roster-import-row-status--ready">Ready</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {invalidRows.length > 0 ? (
            <ul className="roster-import-error-list" aria-label="Rows to fix">
              {invalidRows.slice(0, 3).map((row) => (
                <li key={row.rowNumber}><strong>Row {row.rowNumber}:</strong> {row.error}</li>
              ))}
              {invalidRows.length > 3 ? <li>And {invalidRows.length - 3} more rows need attention.</li> : null}
            </ul>
          ) : null}
          <footer className="roster-import-preview-footer">
            <p>{invalidRows.length ? 'Rows with errors will be skipped.' : 'All rows look good.'}</p>
            <Button type="button" size="sm" disabled={validRows.length === 0} onClick={importValidPlayers}>
              Add {validRows.length} {validRows.length === 1 ? 'player' : 'players'}
            </Button>
          </footer>
        </div>
      ) : null}
    </section>
  )
}

'use client'

import { useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { DEFAULT_TEAM_COLORS, type Team } from './types'

interface Props {
  open: boolean
  team: Team | null
  onOpenChange: (open: boolean) => void
  onSave: (team: Team) => void
}

export function TeamSetupDialog({ open, team, onOpenChange, onSave }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const values = new FormData(event.currentTarget)
    const name = String(values.get('name') ?? '').trim()
    const enteredShortName = String(values.get('shortName') ?? '').trim()
    const shortName = enteredShortName || name.replace(/[^a-z0-9]/gi, '').slice(0, 3).toUpperCase()
    if (!name || !shortName) return

    onSave({
      name,
      shortName: shortName.slice(0, 4).toUpperCase(),
      primaryColor: String(values.get('primaryColor') ?? DEFAULT_TEAM_COLORS.primaryColor),
      secondaryColor: String(values.get('secondaryColor') ?? DEFAULT_TEAM_COLORS.secondaryColor),
    })
  }

  return (
    <dialog
      ref={dialogRef}
      className="modal-dialog team-dialog"
      aria-labelledby="team-dialog-title"
      onCancel={(event) => {
        event.preventDefault()
        onOpenChange(false)
      }}
      onClose={() => onOpenChange(false)}
      onClick={(event) => {
        if (event.target === dialogRef.current) onOpenChange(false)
      }}
    >
      <div className="modal-content">
        <header className="modal-header">
          <div>
            <p className="section-kicker">CLUB PROFILE</p>
            <h2 id="team-dialog-title" className="modal-title">
              {team ? 'Edit club details' : 'Set up your club'}
            </h2>
            <p className="modal-copy">Give your workspace a name and matchday colors.</p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="icon-button"
            aria-label="Close club setup"
            onClick={() => onOpenChange(false)}
          >
            <span aria-hidden="true">×</span>
          </Button>
        </header>

        <form key={`${team?.name ?? 'new'}-${open}`} onSubmit={handleSubmit}>
          <fieldset className="form-fieldset">
            <legend className="sr-only">Club details</legend>
            <div className="form-grid">
              <label className="form-field form-field--wide">
                <span>Club name</span>
                <input
                  className="form-control"
                  name="name"
                  defaultValue={team?.name ?? ''}
                  placeholder="e.g. Riverside Athletic"
                  autoComplete="organization"
                  maxLength={60}
                  required
                />
              </label>
              <label className="form-field">
                <span>Short name</span>
                <input
                  className="form-control"
                  name="shortName"
                  defaultValue={team?.shortName ?? ''}
                  placeholder="RVA"
                  maxLength={4}
                  aria-describedby="club-short-name-help"
                />
                <small id="club-short-name-help">Used on lineup and score graphics.</small>
              </label>
              <div className="form-field color-field">
                <label htmlFor="club-primary-color">Primary color</label>
                <input
                  id="club-primary-color"
                  className="color-control"
                  name="primaryColor"
                  type="color"
                  defaultValue={team?.primaryColor ?? DEFAULT_TEAM_COLORS.primaryColor}
                />
              </div>
              <div className="form-field color-field">
                <label htmlFor="club-secondary-color">Secondary color</label>
                <input
                  id="club-secondary-color"
                  className="color-control"
                  name="secondaryColor"
                  type="color"
                  defaultValue={team?.secondaryColor ?? DEFAULT_TEAM_COLORS.secondaryColor}
                />
              </div>
            </div>
          </fieldset>
          <footer className="form-actions">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Save club profile</Button>
          </footer>
        </form>
      </div>
    </dialog>
  )
}

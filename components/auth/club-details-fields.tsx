import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"

type ClubDetailsFieldsProps = {
  idPrefix?: string
}

export function ClubDetailsFields({ idPrefix = "club" }: ClubDetailsFieldsProps) {
  return (
    <FieldGroup className="auth-fields-grid">
      <Field className="auth-field auth-field--wide">
        <FieldLabel htmlFor={`${idPrefix}-name`}>Club name</FieldLabel>
        <Input
          id={`${idPrefix}-name`}
          name="clubName"
          autoComplete="organization"
          placeholder="e.g. Riverside FC"
          maxLength={80}
          required
        />
      </Field>

      <Field className="auth-field">
        <FieldLabel htmlFor={`${idPrefix}-short-name`}>Short name</FieldLabel>
        <Input
          id={`${idPrefix}-short-name`}
          name="shortName"
          placeholder="e.g. RIV"
          maxLength={4}
          autoCapitalize="characters"
        />
      </Field>

      <Field className="auth-field">
        <FieldLabel htmlFor={`${idPrefix}-city`}>City</FieldLabel>
        <Input
          id={`${idPrefix}-city`}
          name="city"
          autoComplete="address-level2"
          placeholder="Your club city"
          maxLength={100}
          required
        />
      </Field>

      <Field className="auth-field">
        <FieldLabel htmlFor={`${idPrefix}-country`}>Country</FieldLabel>
        <Input
          id={`${idPrefix}-country`}
          name="country"
          autoComplete="country-name"
          placeholder="Your country"
          maxLength={100}
          required
        />
      </Field>

      <Field className="auth-field">
        <FieldLabel htmlFor={`${idPrefix}-competition`}>League or competition</FieldLabel>
        <Input
          id={`${idPrefix}-competition`}
          name="competition"
          placeholder="Optional"
          maxLength={120}
        />
      </Field>
    </FieldGroup>
  )
}

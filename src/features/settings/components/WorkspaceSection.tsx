import Field from '@/components/ui/Field'

export default function WorkspaceSection() {
  return (
    <div className="card p-6 space-y-5">
      <h3 className="section-title text-[15px]">Workspace settings</h3>

      <Field
        label="Burnout threshold"
        id="ws-threshold"
        hint="Alert when workload score exceeds this value (0-100)"
      >
        <input
          id="ws-threshold"
          type="number"
          defaultValue="80"
          min="50"
          max="100"
          className="input-field w-32"
        />
      </Field>
    </div>
  )
}

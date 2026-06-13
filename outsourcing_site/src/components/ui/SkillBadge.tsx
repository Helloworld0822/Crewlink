interface Props {
  skill: string
  variant?: 'default' | 'primary' | 'success'
}

export default function SkillBadge({ skill, variant = 'default' }: Props) {
  const styles = {
    default: { background: 'var(--color-primary-light)', color: 'var(--color-text)', border: '1px solid var(--color-border-light)' },
    primary: { background: 'var(--color-primary)', color: 'var(--color-bg-card)', border: '1px solid var(--color-primary)' },
    success: { background: 'var(--color-success)', color: 'var(--color-bg-card)', border: '1px solid var(--color-success)' },
  }

  return (
    <span
      className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium"
      style={styles[variant]}
    >
      {skill}
    </span>
  )
}

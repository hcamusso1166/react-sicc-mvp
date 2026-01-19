const TextInput = ({ className = '', ...props }) => {
  return (
    <input
      className={['text-input', className].filter(Boolean).join(' ')}
      {...props}
    />
  )
}

export default TextInput
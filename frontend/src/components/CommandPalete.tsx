import { useCallback } from "react"

const CommandPalette = () => {


  const handleCommandAction = useCallback((command : string) => {
    console.log(`Executing command: ${command}`);
  }, []);
  const Commands = [
    {
      name: 'Summarize',
      description: 'Summarize the current chat messages',
    },
    {
      name: 'Translate',
      description: 'Translate the current message',
    },
    {
      name: 'Enhance',
      description: 'Enhance the current message',
    }
  ]
  return (
    <>
    {
      <div className="command-palette-header">
        <h2>Command Palette</h2>
      </div>
    }
      {
      Commands.map((command) => (
        <div key={command.name} className="command-item" onClick={() => handleCommandAction(command.name)}>
          <h3>{command.name}</h3>
          <p>{command.description}</p>
        </div>
      ))}
    </>
  )
}

export default CommandPalette
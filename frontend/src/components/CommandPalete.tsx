import { useCallback } from "react"

const CommandPalette = () => {


  const handleCommandAction = useCallback(async (command : string) => {
    console.log(`Executing command: ${command}`);
    const response = await fetch('/api/commands/execute', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ command }),
    });
    const data = await response.json();
    console.log('Command response:', data);
    
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
        <div key={command.name} className="command-item group cursor-pointer" onClick={() => handleCommandAction(command.name)}>
          <h3 className="font-semibold group cursor-pointer">{command.name}</h3>
          <p className="hidden group-hover:block transition-all duration-300">{command.description}</p>
        </div>
      ))}
    </>
  )
}

export default CommandPalette
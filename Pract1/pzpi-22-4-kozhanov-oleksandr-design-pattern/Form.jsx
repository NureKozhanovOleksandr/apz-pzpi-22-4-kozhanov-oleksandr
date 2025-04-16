import React, { useState } from 'react';

class Command {
  execute() {}
  undo() {}
}

class SaveFormCommand extends Command {
  constructor(receiver, data) {
    super();
    this.receiver = receiver;
    this.data = data;
    this.previousData = null;
  }

  execute() {
    this.previousData = this.receiver.getData();
    this.receiver.save(this.data);
  }

  undo() {
    this.receiver.save(this.previousData);
  }
}

class FormReceiver {
  constructor() {
    this.data = '';
  }

  save(data) {
    this.data = data;
  }

  getData() {
    return this.data;
  }
}

function FormComponent() {
  const [formData, setFormData] = useState('');
  const [history, setHistory] = useState([]);
  const receiver = new FormReceiver();

  const handleSave = () => {
    const command = new SaveFormCommand(receiver, formData);
    command.execute();
    setHistory([...history, command]);
  };

  const handleUndo = () => {
    const lastCommand = history.pop();
    if (lastCommand) {
      lastCommand.undo();
      setHistory([...history]);
      setFormData(receiver.getData());
    }
  };

  return (
    <div>
      <input
        type="text"
        value={formData}
        onChange={(e) => setFormData(e.target.value)}
      />
      <button onClick={handleSave}>Зберегти</button>
      <button onClick={handleUndo} disabled={!history.length}>
        Скасувати
      </button>
      <p>Дані: {receiver.getData()}</p>
    </div>
  );
}

export default FormComponent;
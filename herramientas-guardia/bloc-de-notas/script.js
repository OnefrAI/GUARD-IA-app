document.addEventListener('DOMContentLoaded', () => {
  const noteForm = document.getElementById('noteForm');
  const notesContainer = document.getElementById('notesContainer');
  const generateReportButton = document.getElementById('generateReportButton');

  let lastSavedNote = null;

  // Guardar la nota (sin funcionalidad de fotografía)
  noteForm.addEventListener('submit', (e) => {
    e.preventDefault();
    saveNote();
  });

  function saveNote() {
    const noteData = {
      interventionLocation: document.getElementById('interventionLocation').value,
      documentNumber: document.getElementById('documentNumber').value,
      fullName: document.getElementById('fullName').value,
      birthdate: document.getElementById('birthdate').value,
      parentsName: document.getElementById('parentsName').value,
      address: document.getElementById('address').value,
      phone: document.getElementById('phone').value,
      facts: document.getElementById('facts').value,
      photoUrl: '' // Sin fotografía
    };

    const notes = JSON.parse(localStorage.getItem('notes')) || [];
    notes.push(noteData);
    localStorage.setItem('notes', JSON.stringify(notes));
    displayNotes();

    noteForm.reset();
    alert("Nota guardada exitosamente.");
    lastSavedNote = noteData;
  }

  // Compartir nota usando Web Share API (solo texto)
  function shareNote(noteData) {
    const shareText = `Nota Policial:
Documento: ${noteData.documentNumber || 'N/A'}
Nombre: ${noteData.fullName || 'N/A'}
Fecha de Nacimiento: ${noteData.birthdate || 'N/A'}
Padres: ${noteData.parentsName || 'N/A'}
Dirección: ${noteData.address || 'N/A'}
Teléfono: ${noteData.phone || 'N/A'}
Lugar de Intervención: ${noteData.interventionLocation || 'N/A'}
Hechos: ${noteData.facts || 'N/A'}`;
    
    if (navigator.share) {
      navigator.share({
        title: 'Nota Policial',
        text: shareText
      }).then(() => {
        console.log('Nota compartida exitosamente.');
      }).catch(err => {
        console.error('Error al compartir:', err);
      });
    } else {
      alert("Tu navegador no soporta la función de compartir.");
    }
  }

  // Mostrar notas guardadas
  function displayNotes() {
    const notes = JSON.parse(localStorage.getItem('notes')) || [];
    if (notes.length === 0) {
      notesContainer.innerHTML = "<p>No hay notas guardadas.</p>";
      return;
    }
    notesContainer.innerHTML = notes.map((note, index) => `
      <div class="note">
        <p><strong>Lugar de Intervención:</strong> ${note.interventionLocation || 'N/A'}</p>
        <p><strong>Documento:</strong> ${note.documentNumber || 'N/A'}</p>
        <p><strong>Nombre:</strong> ${note.fullName || 'N/A'}</p>
        <p><strong>Fecha de nacimiento:</strong> ${note.birthdate || 'N/A'}</p>
        <p><strong>Padres:</strong> ${note.parentsName || 'N/A'}</p>
        <p><strong>Dirección:</strong> ${note.address || 'N/A'}</p>
        <p><strong>Teléfono:</strong> ${note.phone || 'N/A'}</p>
        <p><strong>Hechos:</strong> ${note.facts || 'N/A'}</p>
        <button class="btn delete-note-btn" onclick="deleteNote(${index})">Eliminar</button>
        <button class="btn" onclick="shareNoteFromIndex(${index})">Compartir</button>
      </div>
    `).join('');
  }

  window.deleteNote = function(index) {
    const notes = JSON.parse(localStorage.getItem('notes')) || [];
    if (index >= 0 && index < notes.length && confirm("¿Estás seguro de eliminar esta nota?")) {
      notes.splice(index, 1);
      localStorage.setItem('notes', JSON.stringify(notes));
      displayNotes();
    }
  };

  window.shareNoteFromIndex = function(index) {
    const notes = JSON.parse(localStorage.getItem('notes')) || [];
    if (index >= 0 && index < notes.length) {
      shareNote(notes[index]);
    }
  };

  // Generar informe en formato de texto
  generateReportButton.addEventListener('click', generateReport);

  function generateReport() {
    const notes = JSON.parse(localStorage.getItem('notes')) || [];
    let reportText = 'Informe de Intervenciones\n\n';
    
    notes.forEach((note, index) => {
      reportText += `Intervención ${index + 1}\n`;
      reportText += '---------------------------------\n';
      reportText += `Lugar de Intervención: ${note.interventionLocation || 'N/A'}\n`;
      reportText += `Documento: ${note.documentNumber || 'N/A'}\n`;
      reportText += `Nombre: ${note.fullName || 'N/A'}\n`;
      reportText += `Fecha de Nacimiento: ${note.birthdate || 'N/A'}\n`;
      reportText += `Padres: ${note.parentsName || 'N/A'}\n`;
      reportText += `Dirección: ${note.address || 'N/A'}\n`;
      reportText += `Teléfono: ${note.phone || 'N/A'}\n`;
      reportText += `Hechos: ${note.facts || 'N/A'}\n`;
      reportText += '---------------------------------\n\n';
    });
    
    const blob = new Blob([reportText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'informe_intervenciones.txt';
    a.click();
    URL.revokeObjectURL(url);
  }

  displayNotes();
});

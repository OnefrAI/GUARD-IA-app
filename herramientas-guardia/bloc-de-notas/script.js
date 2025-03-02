document.addEventListener('DOMContentLoaded', () => {
  const noteForm = document.getElementById('noteForm');
  const notesContainer = document.getElementById('notesContainer');
  const activateCameraButton = document.getElementById('activateCameraButton');
  const saveNoteButton = document.getElementById('saveNoteButton');
  const videoContainer = document.getElementById('videoContainer');
  const video = document.getElementById('video');
  const capturePhotoButton = document.getElementById('capturePhotoButton');
  const photoPreviewContainer = document.getElementById('photoPreviewContainer');
  const photoPreview = document.getElementById('photoPreview');
  const photoActions = document.getElementById('photoActions');
  const retakePhotoButton = document.getElementById('retakePhotoButton');
  const deletePhotoButton = document.getElementById('deletePhotoButton');
  const generateReportButton = document.getElementById('generateReportButton');
  const factsTextArea = document.getElementById('facts');

  let cameraStream = null;
  let tempPhotoData = '';
  let lastSavedNote = null;

  // Iniciar la cámara
  function startCamera() {
    navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } })
      .then(stream => {
        cameraStream = stream;
        video.srcObject = stream;
        video.play();
        videoContainer.style.display = 'block';
        capturePhotoButton.style.display = 'block';
        activateCameraButton.style.display = 'none';
      })
      .catch(err => {
        console.error("Error al acceder a la cámara:", err);
        alert("No se pudo acceder a la cámara. Asegúrate de haber otorgado permisos.");
      });
  }

  // Capturar foto con filtro para atenuar brillos (en color)
  function capturePhoto() {
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext('2d');
    // Aplicar un filtro que atenúa brillo y saturación sin convertir a blanco y negro
    context.filter = 'brightness(0.9) saturate(0.9)';
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    tempPhotoData = canvas.toDataURL('image/png');

    photoPreview.src = tempPhotoData;
    photoPreviewContainer.style.display = 'block';
    videoContainer.style.display = 'none';
    capturePhotoButton.style.display = 'none';
    photoActions.style.display = 'flex';

    // Detener la cámara
    stopCamera();
  }

  // Detener la cámara
  function stopCamera() {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      cameraStream = null;
    }
    videoContainer.style.display = 'none';
    capturePhotoButton.style.display = 'none';
    activateCameraButton.style.display = 'block';
  }

  // Activar la cámara al pulsar el botón azul
  activateCameraButton.addEventListener('click', () => {
    if (!cameraStream) {
      startCamera();
    }
  });

  // Evento para capturar la foto
  capturePhotoButton.addEventListener('click', () => {
    capturePhoto();
  });

  // Evento para rehacer la foto
  retakePhotoButton.addEventListener('click', () => {
    tempPhotoData = '';
    photoPreviewContainer.style.display = 'none';
    photoActions.style.display = 'none';
    startCamera();
  });

  // Evento para eliminar la foto
  deletePhotoButton.addEventListener('click', () => {
    if (confirm("¿Estás seguro de eliminar la foto?")) {
      tempPhotoData = '';
      photoPreviewContainer.style.display = 'none';
      photoActions.style.display = 'none';
      activateCameraButton.style.display = 'block';
    }
  });

  // Guardar la nota, incluyendo el campo "Lugar de intervención"
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
      photoUrl: tempPhotoData
    };

    const notes = JSON.parse(localStorage.getItem('notes')) || [];
    notes.push(noteData);
    localStorage.setItem('notes', JSON.stringify(notes));
    displayNotes();

    noteForm.reset();
    tempPhotoData = '';
    photoPreviewContainer.style.display = 'none';
    photoActions.style.display = 'none';
    activateCameraButton.style.display = 'block';
    alert("Nota guardada exitosamente.");

    lastSavedNote = noteData;
  }

  // Compartir nota usando la Web Share API (solo texto en este ejemplo)
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

  // Mostrar notas guardadas en pantalla
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
        ${note.photoUrl ? `<img src="${note.photoUrl}" alt="Foto de la nota">` : ''}
        <button onclick="deleteNote(${index})">Eliminar</button>
        <button onclick="shareNoteFromIndex(${index})">Compartir</button>
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

  // Función para generar el informe en formato de texto legible
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

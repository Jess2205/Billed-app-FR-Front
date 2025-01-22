import { ROUTES_PATH } from '../constants/routes.js'
import Logout from "./Logout.js"

export default class NewBill {
  constructor({ document, onNavigate, store, localStorage }) {
    this.document = document
    this.onNavigate = onNavigate
    this.store = store
    const formNewBill = this.document.querySelector(`form[data-testid="form-new-bill"]`)
    formNewBill.addEventListener("submit", this.handleSubmit)
    const file = this.document.querySelector(`input[data-testid="file"]`)
    file.addEventListener("change", this.handleChangeFile)
    this.fileUrl = null
    this.fileName = null
    this.billId = null
    new Logout({ document, localStorage, onNavigate })
  }
  // Cette fonction est appelée lors du changement de fichier
  onFileChange = ({ file, filePath }) => {
    // Vous pouvez ici traiter le fichier, par exemple en téléchargeant le fichier ou en le stockant dans une variable
    console.log('Fichier sélectionné:', file);
    console.log('Chemin du fichier:', filePath);
    
    // Par exemple, vous pouvez définir l'URL du fichier
    this.fileUrl = URL.createObjectURL(file);
  };

  handleChangeFile = (event) => {
    event.preventDefault();
  
    const fileInput = event.target;
    const file = fileInput.files[0];
    const allowedExtensions = ['jpg', 'jpeg', 'png']; // Extensions autorisées
    const errorMessage = document.getElementById('fileFormat-errorMessage');
  
    if (file) {
      const fileExtension = file.name.split('.').pop().toLowerCase(); // Récupérer l'extension du fichier
  
      // Vérifier si l'extension est autorisée
      if (!allowedExtensions.includes(fileExtension)) {
        errorMessage.style.display = 'block'; // Afficher l'erreur dans le DOM
        fileInput.value = ''; // Réinitialiser l'input file
        return;
      }
  
      errorMessage.style.display = 'none'; // Masquer le message d'erreur si l'extension est valide
      this.fileName = file.name;
      const filePath = fileInput.value;
      this.onFileChange({ file, filePath }); // Appel de onFileChange
    }
  };
  

  handleSubmit = e => {
    e.preventDefault()
    console.log('e.target.querySelector(`input[data-testid="datepicker"]`).value', e.target.querySelector(`input[data-testid="datepicker"]`).value)
    const email = JSON.parse(localStorage.getItem("user")).email
    const bill = {
      email,
      type: e.target.querySelector(`select[data-testid="expense-type"]`).value,
      name:  e.target.querySelector(`input[data-testid="expense-name"]`).value,
      amount: parseInt(e.target.querySelector(`input[data-testid="amount"]`).value),
      date:  e.target.querySelector(`input[data-testid="datepicker"]`).value,
      vat: e.target.querySelector(`input[data-testid="vat"]`).value,
      pct: parseInt(e.target.querySelector(`input[data-testid="pct"]`).value) || 20,
      commentary: e.target.querySelector(`textarea[data-testid="commentary"]`).value,
      fileUrl: this.fileUrl,
      fileName: this.fileName,
      status: 'pending'
    }
    this.updateBill(bill)
    this.onNavigate(ROUTES_PATH['Bills'])
  }

  // not need to cover this function by tests
  updateBill = (bill) => {
    if (this.store) {
      this.store
      .bills()
      .update({data: JSON.stringify(bill), selector: this.billId})
      .then(() => {
        this.onNavigate(ROUTES_PATH['Bills'])
      })
      .catch(error => console.error(error))
    }
  }
}
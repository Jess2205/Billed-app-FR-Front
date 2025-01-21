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
  handleChangeFile = e => {
    e.preventDefault();

    // Cache tout message d'erreur au début
    const errorMessage = document.querySelector(".error-message");
    errorMessage.style.display = "none"; // Masque l'erreur par défaut

    // Modification : Change 'this.document' en 'document' pour accéder au DOM correctement
    const fileInput = e.target;
    const file = fileInput.files[0]; // récupère le fichier sélectionné

    // Vérification de l'existence du fichier
    if (file) {
        const filePath = e.target.value.split(/\\/g); // Extrait le nom du fichier depuis le chemin
        const fileName = filePath[filePath.length - 1]; // Dernière partie du chemin
        console.log("Nom du fichier : ", fileName);

        // Modification : Extraction de l'extension du fichier en minuscule pour la comparaison
        const fileExtension = fileName.split(".").pop().toLowerCase(); // Extrait et met en minuscule l'extension
        console.log("Extension du fichier : ", fileExtension); // Vérifie l'extension

        // Extensions autorisées
        const allowedExtensions = ["jpg", "jpeg", "png"];

        // Modification : Vérifier si l'extension est valide
        if (!allowedExtensions.includes(fileExtension)) {
            console.log("Extension invalide"); // Débogage pour voir si l'extension est invalide
            errorMessage.style.display = "block"; // Affiche le message d'erreur
            fileInput.value = ""; // Réinitialise l'input file
            return; // Sort de la fonction pour bloquer l'envoi du fichier
        }

        // Si l'extension est valide, masque le message d'erreur
        errorMessage.style.display = "none"; // Masque l'erreur

        // Création du formulaire de données pour l'upload
        const formData = new FormData();
        const email = JSON.parse(localStorage.getItem("user")).email; // Récupère l'email de l'utilisateur
        formData.append("file", file);
        formData.append("email", email);

        // Envoi du fichier au serveur
        this.store
            .bills()
            .create({
                data: formData,
                headers: {
                    noContentType: true,
                },
            })
            .then(({ fileUrl, key }) => {
                console.log(fileUrl);
                this.billId = key;
                this.fileUrl = fileUrl;
                this.fileName = fileName;
            })
            .catch((error) => console.error(error));
    } else {
        console.log("Aucun fichier sélectionné"); // Débogage si aucun fichier n'est sélectionné
        errorMessage.style.display = "block"; // Affiche le message d'erreur si aucun fichier
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
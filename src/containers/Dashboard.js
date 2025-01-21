import { formatDate } from '../app/format.js'
import DashboardFormUI from '../views/DashboardFormUI.js'
import BigBilledIcon from '../assets/svg/big_billed.js'
import { ROUTES_PATH } from '../constants/routes.js'
import USERS_TEST from '../constants/usersTest.js'
import Logout from "./Logout.js"

// Fonction pour filtrer les factures en fonction de leur statut
export const filteredBills = (data, status) => {
  return (data && data.length) ? // Vérification que les données existent et qu'il y en a
    data.filter(bill => {
      let selectCondition

      // Cas d'utilisation dans un environnement de tests (Jest)
      if (typeof jest !== 'undefined') {
        selectCondition = (bill.status === status)
      }
      /* istanbul ignore next */
      else {
        // Cas de production (vérification de l'email de l'utilisateur)
        const userEmail = JSON.parse(localStorage.getItem("user")).email
        selectCondition =
          (bill.status === status) && // Vérifie si le statut correspond
          ![...USERS_TEST, userEmail].includes(bill.email) // Vérifie que l'email de la facture ne correspond pas aux utilisateurs en test
      }

      return selectCondition
    }) : [] // Retourne un tableau vide si les données sont invalides ou vides
}

// Fonction pour générer une carte de facture
export const card = (bill) => {
  const firstAndLastNames = bill.email.split('@')[0] // Extraire le nom de l'email avant "@"
  const firstName = firstAndLastNames.includes('.') ? // Vérifie s'il y a un "." dans le nom
    firstAndLastNames.split('.')[0] : '' // Prend la première partie du nom
  const lastName = firstAndLastNames.includes('.') ? // Si il y a un ".", prend la seconde partie
  firstAndLastNames.split('.')[1] : firstAndLastNames

  // Retourne un template HTML avec les informations de la facture
  return (`
    <div class='bill-card' id='open-bill${bill.id}' data-testid='open-bill${bill.id}'>
      <div class='bill-card-name-container'>
        <div class='bill-card-name'> ${firstName} ${lastName} </div>
        <span class='bill-card-grey'> ... </span>
      </div>
      <div class='name-price-container'>
        <span> ${bill.name} </span>
        <span> ${bill.amount} € </span>
      </div>
      <div class='date-type-container'>
        <span> ${formatDate(bill.date)} </span> <!-- Utilise la fonction pour formater la date -->
        <span> ${bill.type} </span> <!-- Type de la facture -->
      </div>
    </div>
  `)
}

// Fonction pour générer plusieurs cartes de facture
export const cards = (bills) => {
  return bills && bills.length ? bills.map(bill => card(bill)).join("") : "" // Si des factures existent, mappe chaque facture et génère les cartes, sinon retourne une chaîne vide
}

// Fonction pour obtenir le statut en fonction de l'index
export const getStatus = (index) => {
  switch (index) {
    case 1:
      return "pending" // En attente
    case 2:
      return "accepted" // Acceptée
    case 3:
      return "refused" // Refusée
  }
}

// Classe principale pour la gestion des factures
export default class {
  constructor({ document, onNavigate, store, bills, localStorage }) {
    this.document = document
    this.onNavigate = onNavigate
    this.store = store
    // Ajoute des écouteurs d'événements pour les icônes de filtrage des factures par statut
    $('#arrow-icon1').click((e) => this.handleShowTickets(e, bills, 1))
    $('#arrow-icon2').click((e) => this.handleShowTickets(e, bills, 2))
    $('#arrow-icon3').click((e) => this.handleShowTickets(e, bills, 3))
    new Logout({ localStorage, onNavigate }) // Initialisation de la déconnexion
  }

  // Gère l'affichage de l'image d'une facture dans une modale
  handleClickIconEye = () => {
    const billUrl = $('#icon-eye-d').attr("data-bill-url") // Récupère l'URL de la facture
    const imgWidth = Math.floor($('#modaleFileAdmin1').width() * 0.8) // Détermine la largeur de l'image
    $('#modaleFileAdmin1').find(".modal-body").html(`<div style='text-align: center;'><img width=${imgWidth} src=${billUrl} alt="Bill"/></div>`) // Affiche l'image dans la modale
    if (typeof $('#modaleFileAdmin1').modal === 'function') $('#modaleFileAdmin1').modal('show') // Affiche la modale si elle existe
  }

  // Gère l'édition d'une facture lorsqu'elle est cliquée
  handleEditTicket(e, bill, bills) {
    if (this.counter === undefined || this.id !== bill.id) this.counter = 0
    if (this.id === undefined || this.id !== bill.id) this.id = bill.id
    if (this.counter % 2 === 0) {
      // Si le compteur est pair, montre les détails de la facture
      bills.forEach(b => {
        $(`#open-bill${b.id}`).css({ background: '#0D5AE5' })
      })
      $(`#open-bill${bill.id}`).css({ background: '#2A2B35' })
      $('.dashboard-right-container div').html(DashboardFormUI(bill)) // Affiche le formulaire de modification
      $('.vertical-navbar').css({ height: '150vh' })
      this.counter ++
    } else {
      // Si le compteur est impair, cache les détails et revient à l'affichage initial
      $(`#open-bill${bill.id}`).css({ background: '#0D5AE5' })

      $('.dashboard-right-container div').html(`
        <div id="big-billed-icon" data-testid="big-billed-icon"> ${BigBilledIcon} </div>
      `)
      $('.vertical-navbar').css({ height: '120vh' })
      this.counter ++
    }
    // Attache les événements pour les boutons de la modale
    $('#icon-eye-d').click(this.handleClickIconEye)
    $('#btn-accept-bill').click((e) => this.handleAcceptSubmit(e, bill))
    $('#btn-refuse-bill').click((e) => this.handleRefuseSubmit(e, bill))
  }

  // Soumet la facture en tant qu'acceptée
  handleAcceptSubmit = (e, bill) => {
    const newBill = {
      ...bill,
      status: 'accepted',
      commentAdmin: $('#commentary2').val() // Récupère le commentaire dans la modale
    }
    this.updateBill(newBill) // Met à jour la facture
    this.onNavigate(ROUTES_PATH['Dashboard']) // Redirige vers le tableau de bord
  }

  // Soumet la facture en tant que refusée
  handleRefuseSubmit = (e, bill) => {
    const newBill = {
      ...bill,
      status: 'refused',
      commentAdmin: $('#commentary2').val() // Récupère le commentaire dans la modale
    }
    this.updateBill(newBill) // Met à jour la facture
    this.onNavigate(ROUTES_PATH['Dashboard']) // Redirige vers le tableau de bord
  }

  // Gère l'affichage des factures filtrées en fonction du statut
  handleShowTickets(e, bills, index) {
    // Initialisation de la variable `counter` et vérification de l'index.
    // Si `this.counter` n'est pas défini ou si `this.index` ne correspond pas à l'index actuel, on réinitialise le compteur à 0.
    if (this.counter === undefined || this.index !== index) this.counter = 0;
  
    // Si `this.index` n'est pas défini ou si l'index actuel est différent, on met à jour `this.index`.
    if (this.index === undefined || this.index !== index) this.index = index;
  
    // On vérifie si le compteur est pair ou impair.
    if (this.counter % 2 === 0) {
      // Si le compteur est pair (affichage de la liste des tickets), on réinitialise l'icône de la flèche à 0 degré.
      $(`#arrow-icon${this.index}`).css({ transform: 'rotate(0deg)'});
  
      // On met à jour le conteneur des tickets (bills) en filtrant selon le statut de l'index actuel, puis on applique la fonction `cards`.
      $(`#status-bills-container${this.index}`)
        .html(cards(filteredBills(bills, getStatus(this.index))));
  
      // Incrémentation du compteur.
      this.counter ++;
    } else {
      // Si le compteur est impair (masquage de la liste des tickets), on fait pivoter l'icône de la flèche à 90 degrés.
      $(`#arrow-icon${this.index}`).css({ transform: 'rotate(90deg)'});
  
      // On vide le conteneur des tickets.
      $(`#status-bills-container${this.index}`)
        .html("");
  
      // Incrémentation du compteur.
      this.counter ++;
    }
  
    // On boucle à travers chaque ticket (bill) et on attache un événement de clic pour éditer le ticket correspondant.
    bills.forEach(bill => {
      // Ajout d'un gestionnaire d'événements pour chaque `bill`, lorsqu'un ticket est cliqué, la fonction `handleEditTicket` est exécutée.
      $(`#status-bills-container${index} #open-bill${bill.id}`).click((e) => this.handleEditTicket(e, bill, bills));
    });
  
    // Retour des `bills` après l'exécution.
    return bills;
  }
  
   // Récupère toutes les factures depuis le store
   getBillsAllUsers = () => {
    if (this.store) {
      return this.store
      .bills()
      .list()
      .then(snapshot => {
        const bills = snapshot
        .map(doc => ({
          id: doc.id,
          ...doc,
          date: doc.date,
          status: doc.status
        }))
        return bills
      })
      .catch(error => {
        throw error;
      })
    }
  }


  // Met à jour une facture dans le store
  // not need to cover this function by tests
  /* istanbul ignore next */
  updateBill = (bill) => {
    if (this.store) {
    return this.store
      .bills()
      .update({data: JSON.stringify(bill), selector: bill.id})
      .then(bill => bill)
      .catch(console.log)
    }
  }
}
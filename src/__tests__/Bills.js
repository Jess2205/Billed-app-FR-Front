/**
 * @jest-environment jsdom
 */

import { screen, waitFor } from "@testing-library/dom";
import '@testing-library/jest-dom';
import userEvent from "@testing-library/user-event"; // Pour simuler des événements utilisateur
import BillsUI from "../views/BillsUI.js";
import { bills } from "../fixtures/bills.js";
import { ROUTES,ROUTES_PATH } from "../constants/routes.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import Bills from "../containers/Bills.js";
import mockStore from "../__mocks__/store";

import router from "../app/Router.js";

// Définition de la fonction onNavigate qui modifie le contenu du DOM en fonction du chemin (pathname)
// Elle remplace le contenu de <body> avec le rendu de la route correspondant à pathname
const onNavigate = (pathname) => {
  // Utilise la fonction ROUTES pour obtenir le rendu correspondant à la route demandée
  // ROUTES est probablement une fonction de routage qui génère un rendu pour le chemin spécifié
  document.body.innerHTML = ROUTES({ pathname });
};

// Mock de la méthode du store "bills" pour simuler un store de données personnalisé lors des tests
// Cela permet de substituer le store original par une version mockée pour les tests unitaires
jest.mock("../app/store", () => mockStore);



describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", async () => {
      Object.defineProperty(window, "localStorage", { value: localStorageMock });
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
        })
      );
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);
      router();
      window.onNavigate(ROUTES_PATH.Bills);
      await waitFor(() => screen.getByTestId("icon-window"));
      const windowIcon = screen.getByTestId("icon-window");
      expect(windowIcon.classList).toContain("active-icon");
    });

    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({ data: bills });
      const dates = screen
        .getAllByText(
          /^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i
        )
        .map((a) => a.innerHTML);
      const antiChrono = (a, b) => (a < b ? 1 : -1);
      const datesSorted = [...dates].sort(antiChrono);
      expect(dates).toEqual(datesSorted);
    });

    test("Then each action eye icon click should open an image modal", async () => {
      // Naviguer vers la page Bills
      window.onNavigate(ROUTES_PATH.Bills);

      // Initialisation de la page Bills
      document.body.innerHTML = BillsUI({ data: bills });

      // Définir le localStorage pour l'utilisateur connecté
      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
        })
      );

      // Création d'une fonction mock pour handleClickIconEye
      const handleClickIconEye1 = jest.fn(bills.handleClickIconEye);

      // Récupération de la première icône "eye" via le test ID
      const eye = screen.getAllByTestId("icon-eye")[0];

      // Attacher l'événement de clic à l'icône
      eye.addEventListener("click", handleClickIconEye1);

      // Simuler le clic sur l'icône
      userEvent.click(eye);

      // Vérifier que la méthode handleClickIconEye a bien été appelée
      expect(handleClickIconEye1).toHaveBeenCalled();

      // Attendre que la modale s'affiche et vérifier qu'elle a la classe 'modal-content'
      await waitFor(() => {
        const modalContent = screen.getByTestId("modal-content");
        expect(modalContent).toHaveClass("modal-content"); // Vérifie la classe
      });
    });

    test("Then it should render the ErrorPage if there is an error", async () => {
      const error = "Erreur de connexion au serveur";
      document.body.innerHTML = BillsUI({ error });

      // Attendre que l'erreur apparaisse
      await waitFor(() => expect(screen.getByText("Erreur")).toBeTruthy());
      await waitFor(() => expect(screen.getByText(error)).toBeTruthy());
    });
  });
});

describe("Given I am on Bills page", () => {
  // Bloc décrivant le comportement lorsque l'utilisateur clique sur le bouton 'New Bill'
  describe("When I click on the 'New Bill' button", () => {
    // Test pour vérifier si la navigation vers la page 'NewBill' fonctionne
    test("Then it should navigate to the 'NewBill' page", () => {
      // Mock de la fonction de navigation
      const onNavigateMock = jest.fn();

      // Création d'un document HTML simulé contenant un bouton 'New Bill'
      const documentMock = document.createElement("div");
      documentMock.innerHTML = `<button data-testid="btn-new-bill"></button>`;

      // Instanciation de la classe Bills avec des objets mockés
      const bills = new Bills({
        document: documentMock,         // Le document HTML simulé
        onNavigate: onNavigateMock,    // La fonction mockée de navigation
        store: null,                   // Aucun store n'est nécessaire pour ce test
        localStorage: window.localStorage, // LocalStorage simulé
      });

      // Récupération du bouton 'New Bill' dans le document simulé
      const buttonNewBill = documentMock.querySelector(`[data-testid="btn-new-bill"]`);

      // Simulation d'un clic sur le bouton
      buttonNewBill.click();

      // Vérification que la fonction de navigation a été appelée avec la route 'NewBill'
      expect(onNavigateMock).toHaveBeenCalledWith(ROUTES_PATH['NewBill']);
    });
  });
});

// Test d'intégration GET
describe("Given I am a user connected as Employee", () => {
  // Contexte : Navigation vers la page des Bills
  describe("When I navigate to Bills page", () => {
    // Test pour vérifier que les notes de frais sont récupérées depuis l'API mockée
    test("fetches bills from mock API GET", async () => {
      // Espionner la méthode "bills" du mockStore
      jest.spyOn(mockStore, "bills");

      // Mock de l'implémentation de la méthode "list" pour retourner une note de frais simulée
      mockStore.bills.mockImplementationOnce(() => {
        return {
          list: () =>
            Promise.resolve([
              {
                id: "47qAXb6fIm2zOKkLzMro",
                vat: "80",
                fileUrl: "https://test.storage.tld/v0/b/test.appspot.com/o/test.jpg",
                status: "pending",
                type: "Hôtel et logement",
                commentAdmin: "ok",
                name: "encore",
                fileName: "preview-facture-free-201801-pdf-1.jpg",
                date: "2004-04-04",
                amount: 400,
                email: "a@a",
                pct: 20,
              },
            ]),
        };
      });

      // Créer un conteneur HTML simulé pour la navigation
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);

      // Initialiser le routeur et naviguer vers la page Bills
      router();
      window.onNavigate(ROUTES_PATH.Bills);
      
      screen.debug();

      // Attendre que le texte "Mes notes de frais" soit visible
      await waitFor(() => screen.getByText("Mes notes de frais"));

      // Vérifier qu'un contenu correspondant à une note de frais est affiché
      const contentPending = await screen.getByText("Hôtel et logement");
      expect(contentPending).toBeTruthy(); // Vérifie que le texte est bien présent
    });
  });
});

describe("Given I am a user connected as Employee", () => {
  // Sous-catégorie pour tester les erreurs liées à la fonction formatDate
  describe("When the formatDate function throws an error", () => {
    
    test("Then it should log the error and return the unformatted date", async () => {
      // Spy pour surveiller les appels à console.log
      const consoleLogSpy = jest.spyOn(console, "log").mockImplementation();

      // Mock de `formatDate` pour simuler une exception
      const mockFormatDate = jest.fn(() => {
        throw new Error("Invalid date"); // Simule une erreur "Invalid date"
      });

      // Objet représentant une facture corrompue (date invalide)
      const corruptedBill = {
        id: "1",
        date: "invalid-date", // Date invalide pour provoquer l'erreur
        status: "pending",
        type: "Hôtel et logement",
        amount: 400,
        commentary: "",
        pct: 20,
        name: "encore",
      };

      // Mock du store pour retourner la facture corrompue
      mockStore.bills.mockImplementationOnce(() => ({
        list: () => Promise.resolve([corruptedBill]), // Retourne une facture corrompue
      }));

      // Prépare le DOM pour inclure l'élément racine
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);
      router(); // Configure le routeur de l'application

      // Simule la navigation vers la page Bills
      window.onNavigate(ROUTES_PATH.Bills);

      // Attend que les factures soient affichées dans l'interface
      await waitFor(() => screen.getByText("Mes notes de frais"));

      // Vérifie que l'erreur a bien été loguée avec les bons paramètres
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.any(Error), "for", corruptedBill);

      // Nettoie le spy pour éviter des interférences dans d'autres tests
      consoleLogSpy.mockRestore();
    });
  });

  // Test pour vérifier la gestion d'une erreur 404 lors de l'appel à l'API
  test("fetches bills from an API and fails with 404 message error", async () => {
    // Mock du store pour simuler une erreur 404
    mockStore.bills.mockImplementationOnce(() => {
      return {
        list: () => {
          return Promise.reject(new Error("Erreur 404")); // Simule une erreur 404
        },
      };
    });

    let response;
    try {
      response = await mockStore.bills().list(); // Tente de récupérer les factures
    } catch (err) {
      response = err; // Capture l'erreur
    }

    // Affiche un message d'erreur dans le DOM
    document.body.innerHTML = BillsUI({ error: response });
    const message = screen.getByText(/Erreur 404/); // Vérifie si le message "Erreur 404" est affiché
    expect(message).toBeTruthy(); // Assertion pour confirmer la présence du message
  });

  // Test pour vérifier la gestion d'une erreur 500 lors de l'appel à l'API
  test("fetches messages from an API and fails with 500 message error", async () => {
    // Mock du store pour simuler une erreur 500
    mockStore.bills.mockImplementationOnce(() => {
      return {
        list: () => {
          return Promise.reject(new Error("Erreur 500")); // Simule une erreur 500
        },
      };
    });

    let response;
    try {
      response = await mockStore.bills().list(); // Tente de récupérer les factures
    } catch (err) {
      response = err; // Capture l'erreur
    }

    // Affiche un message d'erreur dans le DOM
    document.body.innerHTML = BillsUI({ error: response });
    const message = screen.getByText(/Erreur 500/); // Vérifie si le message "Erreur 500" est affiché
    expect(message).toBeTruthy(); // Assertion pour confirmer la présence du message
  });
});

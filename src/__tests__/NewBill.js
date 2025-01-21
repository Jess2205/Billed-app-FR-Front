/**
 * @jest-environment jsdom
 */

import { screen, fireEvent } from "@testing-library/dom"
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"

describe("Given I am connected as an employee", () => {
  // Avant chaque test dans ce bloc "describe", exécute le code suivant
  beforeEach(() => {
    // Initialisation de l'objet localStorage avec des données utilisateur simulées
    // Cela permet de simuler qu'un utilisateur est connecté en tant qu'employé
    localStorage.setItem(
      "user", // Clé sous laquelle les données sont enregistrées
      JSON.stringify({ email: "employee@test.com" }) // Valeur en JSON pour représenter un utilisateur connecté
    );
  });
});

describe("When I am on NewBill Page", () => {
  test("Then the page should render correctly", () => {
    // Générer le HTML de la page NewBill
    const html = NewBillUI();
    document.body.innerHTML = html;

    // Vérifier que les principaux éléments de la page sont présents
    expect(screen.getByTestId("expense-type")).toBeTruthy(); // Le champ de type de dépense
    expect(screen.getByTestId("expense-name")).toBeTruthy(); // Le champ du nom de la dépense
    expect(screen.getByTestId("amount")).toBeTruthy(); // Le champ du montant
    expect(screen.getByTestId("datepicker")).toBeTruthy(); // Le champ de date
    expect(screen.getByTestId("vat")).toBeTruthy(); // Le champ de TVA
    expect(screen.getByTestId("pct")).toBeTruthy(); // Le champ de pourcentage
    expect(screen.getByTestId("commentary")).toBeTruthy(); // Le champ de commentaire
    expect(screen.getByTestId("file")).toBeTruthy(); // Le champ pour le fichier
    expect(screen.getByText("Envoyer une note de frais")).toBeTruthy(); // Le titre de la page
  });
});

// Test pour vérifier le comportement lors de la soumission d'un formulaire valide
describe("Given I am connected as an employee and I am on NewBill Page", () => {
  // Test unitaire : soumission d'un formulaire valide
  test("When I submit a valid form, then it should call handleSubmit", () => {
    // Initialisation de la page avec le formulaire NewBill
    document.body.innerHTML = NewBillUI();

    // Création d'une fonction simulée pour gérer la navigation entre les pages
    const onNavigate = jest.fn();

    // Création d'un mock de store avec une méthode "bills" et "update"
    const store = {
      bills: jest.fn(() => ({
        // La méthode update est simulée pour retourner une promesse résolue avec un objet simulé
        update: jest.fn().mockResolvedValue({ id: "12345", status: "updated" }),
      })),
    };

    // Création d'une instance de la classe NewBill avec les paramètres requis
    const newBill = new NewBill({ document, onNavigate, store });

    // Simulation de la méthode handleSubmit avec une fonction Jest
    const handleSubmit = jest.fn((e) => newBill.handleSubmit(e));

    // Récupération du formulaire à partir de la page simulée
    const form = screen.getByTestId("form-new-bill");

    // Ajout d'un écouteur d'événement "submit" au formulaire qui utilise la méthode simulée handleSubmit
    form.addEventListener("submit", handleSubmit);

    // Déclenchement de l'événement "submit" pour simuler la soumission du formulaire
    fireEvent.submit(form);

    // Vérification que la méthode handleSubmit a bien été appelée
    expect(handleSubmit).toHaveBeenCalled();
  });
});
  // Test pour vérifier le comportement en cas de téléchargement d'un fichier avec un format invalide
  test("When I upload a file with invalid format, then an error message should be displayed", () => {
  // Charger l'interface utilisateur du formulaire NewBill
  document.body.innerHTML = NewBillUI();

  // Mock du store pour éviter de faire des appels réels à l'API
  const store = { bills: jest.fn() };

  // Création d'une instance de la classe NewBill avec les paramètres nécessaires
  const newBill = new NewBill({ document, store });

  // Récupération de l'élément d'entrée de fichier depuis le DOM simulé
  const fileInput = screen.getByTestId("file");

  // Création d'un fichier au format invalide (exemple : fichier texte)
  const file = new File(["dummy content"], "example.txt", { type: "text/plain" });

  // Simulation d'un événement de changement sur l'entrée de fichier, avec le fichier invalide comme cible
  fireEvent.change(fileInput, { target: { files: [file] } });

  // Vérification que le fichier est bien sélectionné et que son nom correspond à celui défini
  expect(fileInput.files[0].name).toBe("example.txt");

  // Vérification que le message d'erreur est bien affiché dans le DOM
  const errorMessage = screen.getByText(
    "Format de fichier invalide. Seuls les fichiers JPG, JPEG ou PNG sont autorisés."
  );

  // Assertion : le message d'erreur doit être visible
  expect(errorMessage).toBeVisible();
});

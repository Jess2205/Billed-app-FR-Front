/**
 * @jest-environment jsdom
 */

import { screen, waitFor } from "@testing-library/dom";
import '@testing-library/jest-dom';
import userEvent from "@testing-library/user-event"; // Pour simuler des événements utilisateur
import BillsUI from "../views/BillsUI.js";
import { bills } from "../fixtures/bills.js";
import { ROUTES_PATH } from "../constants/routes.js";
import { localStorageMock } from "../__mocks__/localStorage.js";

import router from "../app/Router.js";

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
      // Naviguer vers la page des factures
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

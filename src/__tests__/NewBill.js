/**
 * @jest-environment jsdom
 */

import { screen } from "@testing-library/dom"
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

describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    test("Then ...", () => {
      const html = NewBillUI()
      document.body.innerHTML = html
      //to-do write assertion
    })
  })
})

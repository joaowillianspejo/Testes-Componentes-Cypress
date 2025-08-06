/// <reference types='cypress'/>

import React from 'react'
import AddCard from './AddCard'

Cypress.Commands.add('alertErrorHaveText', (expectedText) =>{
  cy.contains('.alert-error', expectedText)
    .should('be.visible')
})

Cypress.Commands.add('fillCardForm', (card) => {
  // cy.contains('label', 'Número do Cartão')
  //   .parent()
  //   .find('input').type(myCard.number)

  cy.get('[data-cy="number"]').type(card.number)
  cy.get('[data-cy="holderName"]').type(card.holderName)
  cy.get('[data-cy="expirationDate"]').type(card.expirationDate)
  cy.get('[data-cy="cvv"]').type(card.cvv)

  cy.get(`[data-cy="bank-${card.bank}"]`).click()
})

Cypress.Commands.add('submitCardForm', () => {
  cy.get('[data-cy="addNewCard"]').click()
})

describe('<AddCard />', () => {
  const card = {
    number: '4242 4242 4242 4242',
    holderName: 'Enrico N Campos',
    expirationDate: '12/35',
    cvv: '123',
    bank: 'neon'
  }
  
  beforeEach(() => {
    cy.viewport(1440, 900)
    cy.mount(<AddCard />)
  })

  it('apresenta erros quando os campos não são informados', () => {
    cy.submitCardForm()

    const alerts = [
      'Número do cartão é obrigatório',
      'Nome do titular é obrigatório',
      'Data de expiração é obrigatória',
      'CVV é obrigatório',
      'Selecione um banco'
    ]

    alerts.forEach((alert) => {
      cy.alertErrorHaveText(alert)
    })
  })

  it('deve cadastrar um novo cartão de crédito', () => {
    cy.fillCardForm(card)

    cy.intercept('POST', 'http://wallet.cardfify.dev/api/cards', (request) => {
      request.reply({
        statusCode: 201,
        body: card
      })
    }).as('addCard')

    cy.submitCardForm()

    cy.wait('@addCard')

    cy.get('.notice-success')
      .should('be.visible')
      .and('have.text', 'Cartão cadastrado com sucesso!')

  })

  it('validar nome do titular com menos de 2 caracteres', () => {
    cy.fillCardForm({...card, holderName: 'E'})

    cy.submitCardForm()

    cy.alertErrorHaveText('Nome deve ter pelo menos 2 caracteres')

  })

  it('validar data de expiração inválida', () => {
    cy.fillCardForm({...card, expirationDate: '99/99'})

    cy.submitCardForm()

    cy.alertErrorHaveText('Data de expiração inválida ou vencida')

  })

  it('validar CVV com menos de 3 dígitos', () => {
    cy.fillCardForm({...card, cvv: '12'})

    cy.submitCardForm()

    cy.alertErrorHaveText('CVV deve ter 3 ou 4 dígitos')

  })
})
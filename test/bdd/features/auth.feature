Feature: Authentication via Ethereum wallet (Metamask-like)
  As a user with an EVM wallet
  I want to authenticate by signing a nonce
  So that I can access protected endpoints

  Background:
    Given a fresh API server

  Scenario: Happy path - user logs in and accesses profile then logs out
    Given I have a random wallet
    When I request a nonce for my wallet address
    And I sign the nonce message with my wallet
    And I verify the signature to login
    Then I should receive an auth token
    When I call GET /auth/me with the auth token
    Then the response should include my wallet address
    When I call POST /auth/logout with the auth token
    Then the logout response should be ok
    And calling GET /auth/me with the same token should be unauthorized

  Scenario: Negative - signature does not match address
    Given I have a random wallet
    And I also have another random wallet
    When I request a nonce for my wallet address
    And I sign the nonce message with the other wallet
    Then verifying the signature should be unauthorized

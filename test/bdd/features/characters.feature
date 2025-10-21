Feature: Characters endpoints
  As an admin
  I want to list characters
  So that I can manage content

  Background:
    Given a fresh API server for characters

  Scenario: GET /characters requires admin
    Given I am logged in as a user for characters
    When I call GET /characters
    Then the characters response status should be 403

  Scenario: GET /characters returns alphabetical list for admin
    Given I am logged in as an admin for characters
    And there are characters for characters:
      | id | name      |
      | 2  | Hercules  |
      | 1  | Achilles  |
      | 3  | Leonidas  |
    When I call GET /characters
    Then the characters response status should be 200
    And the character names should be in order:
      | Achilles |
      | Hercules |
      | Leonidas |

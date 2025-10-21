Feature: Battles endpoints
  As an authenticated user or admin
  I want to interact with battles
  So that I can view upcoming battles and admins can manage them

  Background:
    Given a fresh API server for battles

  Scenario: GET /battles requires authentication
    When I call GET /battles without auth
    Then the response status should be 401

  Scenario: GET /battles returns paginated list for user
    Given I am logged in as a user
    And there are characters:
      | id | name      |
      | 1  | Achilles  |
      | 2  | Hercules  |
      | 3  | Leonidas  |
    And there are battles with titles and times:
      | title                 | startOffsetMinutes |
      | Past Battle One       | -120               |
      | Future Battle Alpha   | 60                 |
      | Future Battle Beta    | 90                 |
    When I call GET /battles with page=1 and limit=2
    Then the response status should be 200
    And the response should contain at most 2 battles

  Scenario: GET /battles supports search
    Given I am logged in as a user
    When I call GET /battles with search="alpha"
    Then the response status should be 200
    And all returned battles should include "alpha" in the title

  Scenario: GET /battles/next returns the next future battle or message
    Given I am logged in as a user
    When I call GET /battles/next
    Then the response status should be 200
    And the response should be either a battle or a no-battle message

  Scenario: POST /battles forbidden for non-admin
    Given I am logged in as a user
    When I create a battle with title "Admin Only" starting in 30 minutes with participations:
      | characterId | isWinner |
      | 1           | false    |
      | 2           | true     |
    Then the response status should be 403

  Scenario: POST /battles validates duplicate participant ids
    Given I am logged in as an admin
    When I create a battle with title "Dup Test" starting in 30 minutes with participations:
      | characterId | isWinner |
      | 1           | false    |
      | 1           | true     |
    Then the response status should be 400

  Scenario: POST /battles succeeds for admin
    Given I am logged in as an admin
    When I create a battle with title "Admin Created" starting in 30 minutes with participations:
      | characterId | isWinner |
      | 2           | false    |
      | 3           | true     |
    Then the response status should be 201

  Scenario: GET /battles/:id protected and returns a text
    Given I am logged in as a user
    When I call GET /battles/123
    Then the response status should be 200

  Scenario: PATCH /battles/:id requires admin
    Given I am logged in as a user
    When I call PATCH /battles/123
    Then the response status should be 403

  Scenario: DELETE /battles/:id requires admin
    Given I am logged in as a user
    When I call DELETE /battles/123
    Then the response status should be 403

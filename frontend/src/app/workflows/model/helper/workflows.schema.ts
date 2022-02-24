export const workflowsSchema =
  {
    "type": "array",
    "items": {
      "oneOf": [
        {
          "type": "object",
          "properties": {
            "workflow": {
              "type": "string"
            }
          },
          "required": [
            "workflow"
          ],
          "additionalProperties": false
        },
        {
          "type": "object",
          "properties": {
            "externalSystem": {
              "type": "string"
            }
          },
          "required": [
            "externalSystem"
          ],
          "additionalProperties": false
        },
        {
          "type": "object",
          "properties": {
            "service": {
              "type": "string"
            }
          },
          "required": [
            "service"
          ],
          "additionalProperties": false
        },
        {
          "type": "object",
          "properties": {
            "command": {
              "type": "string"
            }
          },
          "required": [
            "command"
          ],
          "additionalProperties": false
        },
        {
          "type": "object",
          "properties": {
            "event": {
              "type": "string"
            }
          },
          "required": [
            "event"
          ]
        },
        {
          "type": "object",
          "properties": {
            "policy": {
              "type": "string"
            }
          },
          "required": [
            "policy"
          ],
          "additionalProperties": false
        },
        {
          "type": "object",
          "properties": {
            "user": {
              "type": "string"
            }
          },
          "required": [
            "user"
          ],
          "additionalProperties": false
        },
        {
          "type": "object",
          "properties": {
            "data": {
              "type": "string"
            }
          },
          "required": [
            "data"
          ]
        },
        {
          "type": "object",
          "properties": {
            "page": {
              "type": "array",
              "items": {
                "oneOf": [
                  {
                    "type": "object",
                    "properties": {
                      "pageName": {
                        "type": "string"
                      }
                    },
                    "required": [
                      "pageName"
                    ],
                    "additionalProperties": false
                  },
                  {
                    "type": "object",
                    "properties": {
                      "text": {
                        "type": "string"
                      }
                    },
                    "required": [
                      "text"
                    ],
                    "additionalProperties": false
                  },
                  {
                    "type": "object",
                    "properties": {
                      "button": {
                        "type": "string"
                      },
                      "targetPage": {
                        "type": "string"
                      }
                    },
                    "required": [
                      "button"
                    ],
                    "additionalProperties": false
                  },
                  {
                    "type": "object",
                    "properties": {
                      "input": {
                        "type": "string"
                      },
                      "value": {
                        anyOf: [
                          {
                            "type": "string",
                          },
                          {
                            "type": "integer",
                          }
                        ]
                      }
                    },
                    "required": [
                      "input"
                    ],
                    "additionalProperties": false
                  },
                  {
                    "type": "object",
                    "properties": {
                      "password": {
                        "type": "string"
                      },
                      "value": {
                        anyOf: [
                          {
                            "type": "string",
                          },
                          {
                            "type": "integer",
                          }
                        ]
                      }
                    },
                    "required": [
                      "password"
                    ],
                    "additionalProperties": false
                  }
                ]
              }
            }
          },
          "required": [
            "page"
          ]
        },
        {
          "type": "object",
          "properties": {
            "problem": {
              "type": "string"
            }
          },
          "required": [
            "problem"
          ],
          "additionalProperties": false
        }
      ]
    }
  };

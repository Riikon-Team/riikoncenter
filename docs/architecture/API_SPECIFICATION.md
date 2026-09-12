# API Specification

## Overview
REST API endpoints provided by the NestJS backend. Base URL: `/api/v1`

## OpenAPI YAML Draft

```yaml
openapi: 3.0.0
info:
  title: RiikonCenter API
  version: 1.0.0
paths:
  /auth/login:
    post:
      summary: User login
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                email:
                  type: string
                password:
                  type: string
      responses:
        '200':
          description: Successful login
          content:
            application/json:
              schema:
                type: object
                properties:
                  accessToken:
                    type: string
  
  /users/me:
    get:
      summary: Get current user profile
      security:
        - bearerAuth: []
      responses:
        '200':
          description: User profile
          
  /preferences:
    get:
      summary: Get user preferences
      security:
        - bearerAuth: []
      responses:
        '200':
          description: User preferences object
    put:
      summary: Update user preferences
      security:
        - bearerAuth: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                moduleName:
                  type: string
                settings:
                  type: object

components:
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT
```

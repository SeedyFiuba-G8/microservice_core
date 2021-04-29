# Microservicio (`node.js`)

![CI](https://github.com/SeedyFiuba-G8/microservice_base/actions/workflows/main.yml/badge.svg) [![codecov](https://codecov.io/gh/SeedyFiuba-G8/microservice_base/branch/main/graph/badge.svg?token=7KVTLW14VK)](https://codecov.io/gh/SeedyFiuba-G8/microservice_base)



# Setup de un nuevo microservicio

1. Crear un repo a partir de esta template. El nombre del repo debe ser microservice_\<nombre del microservicio\>
2. Crear una nueva app en Heroku  
    ![image](https://user-images.githubusercontent.com/3434572/116131143-66877c00-a6a2-11eb-909f-6aba3c2b7a99.png)
3. Ponerle de nombre sf-tdp2-\<nombre del microservicio\>
4. En Deployment method, seleccionar GitHub 
    ![image](https://user-images.githubusercontent.com/3434572/116131371-afd7cb80-a6a2-11eb-950d-f5911e05fcbf.png)
5. Conectar la app de Heroku al repo que se creó antes.
    ![image](https://user-images.githubusercontent.com/3434572/116131446-c8e07c80-a6a2-11eb-9466-48fe13a43ba7.png)
6. Activar el automatic push-deploy clickeando en "Enable Automatic Deploys". Tambien tildar "Wait for CI to pass before deploy".
    ![image](https://user-images.githubusercontent.com/3434572/116131578-f1687680-a6a2-11eb-897b-95ec1f689ead.png)
7. Ir a https://codecov.io/gh y agregar el repo desde la organización. 
    ![image](https://user-images.githubusercontent.com/3434572/116131887-4c01d280-a6a3-11eb-9d05-cc11c78af4b7.png)
    ![image](https://user-images.githubusercontent.com/3434572/116131929-591ec180-a6a3-11eb-8db2-f10801d9ca69.png)
8. Copiar el token de codecov 
    ![image](https://user-images.githubusercontent.com/3434572/116132020-705daf00-a6a3-11eb-97de-6250db8fa9d3.png)
9. Ir a los Settings del repositorio, a la seccion Secrets

    ![image](https://user-images.githubusercontent.com/3434572/116132152-97b47c00-a6a3-11eb-9a52-f1c5ea1d4e0b.png)
10. Agregar un nuevo Secret con el nombre CODECOV_TOKEN
    ![image](https://user-images.githubusercontent.com/3434572/116132295-c599c080-a6a3-11eb-9829-8864aa0720dc.png)
11. Badge de CI. Copiar al readme del nuevo repo `![CI](https://github.com/SeedyFiuba-G8/<NOMBRE REPO>/actions/workflows/main.yaml/badge.svg)` y reemplazar <NOMBRE REPO> por el nombre del repositorio.
13. Badge de Codecov: En Codecov, ir a settings > Badge y copiar el Markdown que aparece ahí al readme del nuevo repo. 
14. Clonar el repo a tu local 
15. Correr `npm install`
16. Correr en la terminal `heroku git:remote -a sf-tdp2-<nombre del microservicio>` para agregar el remote de heroku. 
17. Correr `heroku stack:set container`
18. Correr `git push heroku main` para disparar la primera build. Después de esto, ya queda setupeado el continuous deploy y no hay que hacer nunca mas esto.
19. Si entran a la URL de la app de heroku, deberian ver esto si todo salio bien:
    ![image](https://user-images.githubusercontent.com/3434572/116134041-cdf2fb00-a6a5-11eb-8442-538be10ca589.png)
20. Happy hacking!

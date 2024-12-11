# Proyecto de Gestión de HOTELUDP
Realizado por el grupo 6, compuesto por Sebastian Leon y Vicente Jorquera

Este proyecto permite gestionar la información de los empleados, incluyendo la actualización de cargos y sueldos, entre otras cosas. Utiliza Node.js con Express y se conecta a una base de datos Neon.

## Requisitos

Asegúrate de tener instalado [Node.js](https://nodejs.org/) en tu máquina. También necesitas tener acceso a la terminal o consola de comandos.
Nosotros llevamos a cabo esto en stackblitx, por lo que adjuntamos el link de stackblitz, donde podran ejecutarlo, ademas del github donde estan los archivos y el link de la base de datos de neon.

Link Stackblitz: https://stackblitz.com/edit/stackblitz-starters-7gnez1pj?file=README.txt
Link y credenciales Neon:

import { neon } from '@neondatabase/serverless';

const sql = neon('postgresql://neondb_owner:gthSdMJpZC08@ep-quiet-hill-a5kugwj9.us-east-2.aws.neon.tech/neondb?sslmode=require');

const posts = await sql('SELECT * FROM posts');




Link Github:

## Instalación de Dependencias

Antes de ejecutar el proyecto, necesitas instalar las dependencias necesarias. Para ello, sigue estos pasos:

1. Clona el repositorio o descarga el proyecto en tu máquina.
2. Abre la terminal en la carpeta del proyecto.
3. Ejecuta el siguiente comando para instalar las dependencias necesarias:

    npm install

   Esto descargará e instalará todas las librerías necesarias listadas en el archivo `package.json`, que incluyen:

   - `@neondatabase/serverless`
   - `cors`
   - `express`
   - `pg`
   - `readline-sync`

## Ejecución del Proyecto

Una vez que todas las dependencias estén instaladas, puedes iniciar el servidor con el siguiente comando:

node app.js


Este este archivo zip se adjuntan los codigo utilizados en el proyecto, el readme y el video de la presentacion del proyecto.

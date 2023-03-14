# Getting Started with Create React App

This project was bootstrapped with [Create Next App]().

## 🚀 Tech Used

- Next js
- tailwind css

## Project Folder Structure

```
└── public
    ├── images
    │   └── example.png
    └── favicon.ico
└── src
    ├── components
    │   ├── Button
    │   ├── Modal
    │   ├── Input
    │   └── index.ts // this file exports all components
    ├── pages
    │   ├── Home
    │   ├── Login
    │   ├── Chat
    │   ├── Game
    │   └── index.ts // this file exports all pages
    ├── hooks
    │   ├── Context
    │   └── index.ts // this file exports all hooks
    ├── interfaces
    │   ├── User
    │   ├── Channel
    │   ├── Message
    │   ├── Game
    │   └── index.ts // this file exports all interfaces
    └── App.tsx // this is the entry point of our app
```

# Getting started

## Clone the repo

```bash
$ git clone git@github.com:Hicham-BelHoucin/ft_transcendence.git
$ cd ft_transcendence
```

Now we will need to checkout to the `dev` branch

```bash
$ git checkout dev
```

## Install dependencies

```bash
$ yarn install
```

or

```bash
$ npm i
```

## Create your branch

Your branch name should be in the following format: feature/your-feature-name, hotfix/your-hotfix-name, bugfix/your-bugfix-name

```bash
$ git checkout -b feature/your-feature-name
```

## Run the app

```bash
$ yarn dev
```

or

```bash
$ npm run dev
```

## Code!

Go to `http://localhost:3000` and start hacking!

## Commit your changes

We really don't want a commit with a billion changes, please commit before every minor change, and write clear and short commit messages'

```bash
$ git add .

$ git commit -m "your commit message"
```

## Push your changes

```bash
$ git push origin your-branch-name
```

## Create a merge request

Go to the [Github repo](https://github.com/Hicham-BelHoucin/ft_transcendence) and create a merge request to the `dev` branch

## Pull the latest changes

After your, or someone else's merge request is merged, you will need to pull the latest changes from the `dev` branch

```bash
$ git checkout dev

$ git pull origin dev
```

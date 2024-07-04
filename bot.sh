#!/bin/bash

echo -e "\e[32m   ___  _____         __   _____  _   "
echo -e "  / _ \\ \\_   \\/\\ /\\  / /   \\_   \\/_\\  "
echo -e " / /_\\/  / /\\/ / \\ \\/ /     / /\\//_\\\\ "
echo -e "/ /_\\\\\\/ /_  \\ \\_/ / /___/\\/ /_/  _  \\"
echo -e "\\____/\\____/  \\___/\\____/\\____/\\_/ \\_\\"
echo -e "                                       \e[0m"

if [ ! -d "sessao" ]; then
  mkdir sessao
fi

if [ "$(ls -A sessao)" ]; then
    echo -e "\e[33mVerificando se há sessão ativa..."
    echo -e "\e[32mSessão encontrada! Conectando...\e[0m"
    node ./aut/1.js
else
    echo -e "\e[31mSem sessão ativa, escolha uma opção:\e[0m"
    echo -e "\e[34m[ 1 ] QR-Code"
    echo -e "[ 2 ] Código de pareamento\e[0m"

    read -p "Escolha uma opção: " option

    case $option in
        1)
            echo -e "\e[34mIniciando conexão com QR-Code...\e[0m"
            node ./aut.1.js
            ;;
        2)
            echo -e "\e[34mIniciando conexão com código...\e[0m"
            node ./aut/2.js
            ;;
        *)
            echo -e "\e[31mOpção inválida.\e[0m"
            ;;
    esac
fi

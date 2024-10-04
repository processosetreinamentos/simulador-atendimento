// Importações
import { gerarResposta } from './adm_scripts.js'
import { aguardandoCalmo, aguardandoIrritado } from './clientes_scripts.js'

// Elementos do DOM
const chatContainer = document.getElementById('chat-container')
const userInput = document.getElementById('user-input')
const botaoEnviar = document.getElementById('enviar')
const divCliente = document.getElementById('div-box-cliente')
const timer = document.querySelector("#timeryt")
const btn_iniciar_simul = document.querySelector("#iniciar_simul")
const chatbox = document.querySelector(".container-css")
const audioNotif = document.getElementById('audio-notif')
const audioPop = document.getElementById('audio-pop')
const botaoFinalizar = document.getElementById('finalizar')
const modal = document.querySelector("dialog")
const botaoFecharModal = document.getElementById("modal-button")

// Variáveis Globais
let contagemMensagens = 0
let ULTIMOS_TME = []
let dadosStatus
let contadorHumor = 0
const tipoStatus = ['CALMO', 'IRRITADO']
let statusAtual = tipoStatus[indiceAleatorio(tipoStatus)]; // Gerar indice aleatório
let tmpini = null
let minutoglobal = 0
let segundoglobal = 0
let minutoFinal = 0
let segundoFinal = 0
let intervalo = null

// Definição de Status do Cliente
const statusCliente = {
    CALMO: { nome: 'Calmo', tempoMaximo: 2 },
    IRRITADO: { nome: 'Irritado', tempoMaximo: 4 },
}

// Função para gerar indice aleatório 
function indiceAleatorio(array) {
    let randomArray = Math.floor(Math.random() * array.length)
    return randomArray
}

for (let variacao in statusCliente) {
    if (variacao === statusAtual) {
        dadosStatus = statusCliente[variacao]
    }
}

// Função para exibir mensagem
function exibirMensagem(nome, mensagem, tipo) {
    const novaMensagem = document.createElement('div')
    novaMensagem.classList.add('mensagem')
    novaMensagem.classList.add(tipo === 'atendente' ? 'atendente' : 'cliente')
    
    const info = document.createElement('div')
    info.classList.add('info')
    info.textContent = nome
    
    const texto = document.createElement('div')
    texto.classList.add('texto')
    texto.textContent = mensagem
    
    const hora = document.createElement('div')
    hora.classList.add('hora')
    hora.textContent = obterHora()
    
    novaMensagem.appendChild(info)
    novaMensagem.appendChild(texto)
    novaMensagem.appendChild(hora)
    
    chatContainer.appendChild(novaMensagem)
    
    // Rolagem automática para exibir a última mensagem
    chatContainer.scrollTop = chatContainer.scrollHeight
}

// Função para obter a hora atual da mensagem enviada
function obterHora() {
    let horaAtual = new Date()
    const hora = `${horaAtual.getHours().toString().padStart(2, '0')}:${horaAtual.getMinutes().toString().padStart(2, '0')}:${horaAtual.getSeconds().toString().padStart(2, '0')}`
    return hora
}

// Função para resposta automática
function respostaAutomatica() {
    
    let mensagemAutomatica = null
    
    function msg_aguardando (status_select) {
        switch (status_select) {
            case 'CALMO':
                mensagemAutomatica = aguardandoCalmo[indiceAleatorio(aguardandoCalmo)]
            break
                
            case 'IRRITADO':
                mensagemAutomatica = aguardandoIrritado[indiceAleatorio(aguardandoIrritado)]
            break
                    
            default:
                return []
        }
    }

    msg_aguardando(statusAtual)
    audioPop.play()
    exibirMensagem(`Cliente (${dadosStatus.nome})`, mensagemAutomatica, 'cliente')
}

//Verifica a soma dos dois últimos TMEs e atualiza o Status do cliente
function upgradeStatus() {
    let totalTempos = 0
                
    if (ULTIMOS_TME.length > 4) {
                    
        // Iterar sobre os valores em ULTIMOS_TME
        for (let tempo of Object.values(ULTIMOS_TME)) {
            totalTempos = totalTempos + tempo
        }
                    
        if ((totalTempos <= 45) & (statusAtual === tipoStatus[1])) {
            statusAtual = tipoStatus[0]
            dadosStatus = statusCliente.CALMO
            contadorHumor++
            document.getElementById("humorFinal").textContent = contadorHumor
            ULTIMOS_TME = []
            totalTempos = 0
        } else if ((totalTempos <= 45) & (statusAtual === tipoStatus[0])) {
            ULTIMOS_TME = []
            totalTempos = 0
        } else {
            ULTIMOS_TME = []
            totalTempos = 0
        }
    }
}
            
const contador = () => {
    const tmpatual = Date.now()
    let cont = tmpatual - tmpini
    let seg = Math.floor((cont)/1000)
    timer.innerHTML = converter(seg)
}
            
const converter = (seg) => {
    const hora = Math.floor(seg/3600)
    const resto = seg%3600
    const minuto = Math.floor(resto/60)
    const segundo = Math.floor(resto%60)
    const tempoformatado = (hora < 10 ? "0" +hora:hora)+":"+(minuto < 10 ? "0" +minuto:minuto)+":"+(segundo < 10 ? "0" +segundo:segundo)
    minutoglobal = minuto
    segundoglobal = segundo
    return tempoformatado
}

function repetirMensagem() {
    if (contagemMensagens >= 0 & segundoglobal == 50){
        respostaAutomatica()
    }
}

function calcularTE() {
    if (minutoglobal >= 2) {
        divCliente.classList.add('limite-atingido')
        divCliente.classList.remove('bg-white')
    } else {
        divCliente.classList.remove('limite-atingido')
        divCliente.classList.add('bg-white')
    }
}

// Função para verificar o tempo de resposta
function humorTempoEspera() {
    if (minutoglobal == dadosStatus.tempoMaximo) {
        if (statusAtual == tipoStatus[0]) {
            dadosStatus = statusCliente.IRRITADO
            statusAtual = tipoStatus[1]
            contadorHumor++
            document.getElementById("humorFinal").textContent = contadorHumor
        }
    }
}

// Função para enviar mensagem
function enviarMensagem() {
    const mensagemUsuario = userInput.value.trim()
    
    if (mensagemUsuario) {
        exibirMensagem('Eu', mensagemUsuario, 'atendente')
        userInput.value = ''
        
        minutoFinal = minutoFinal + minutoglobal
        segundoFinal = segundoFinal + segundoglobal
        if (segundoFinal == 60) {
            minutoFinal++
            segundoFinal = 0
        } else if (segundoFinal > 60) {
            const diferencaSeg = Math.trunc(segundoFinal/60)
            const restoSeg = (segundoFinal / 60 - diferencaSeg) * 60
            minutoFinal = minutoFinal + diferencaSeg
            segundoFinal = Math.trunc(restoSeg)
        }
        document.getElementById("minutoFinal").textContent = minutoFinal
        document.getElementById("segundoFinal").textContent = segundoFinal
        
        tmpini = Date.now()
        
        // Verificar e atualizar o status do cliente
        contagemMensagens += 1
        
        // Se o intervalo já estiver sendo executado, limpe-o
        ULTIMOS_TME.push(minutoglobal, segundoglobal)
        upgradeStatus()
        
        // Simular resposta automática após o tempo de espera ajustado
        setTimeout(() => {
            audioPop.play()
            exibirMensagem(`Cliente (${dadosStatus.nome})`, gerarResposta(mensagemUsuario), 'cliente')
        }, 8000);
    }
}

function iniciarAtendimento() {
    audioNotif.play()
    tmpini = Date.now()
    intervalo = setInterval(contador, 1000)
    setTimeout(respostaAutomatica, 3000)
    setInterval(calcularTE, 1000)
    setInterval(humorTempoEspera, 1000)
    setInterval(repetirMensagem, 1000)
    chatbox.style.display = 'grid'
    btn_iniciar_simul.style.display = 'none'
}

function finalizarAtendimento() {
    minutoFinal = minutoFinal + minutoglobal
    segundoFinal = segundoFinal + segundoglobal
    if (segundoFinal == 60) {
        minutoFinal++
        segundoFinal = 0
    } else if (segundoFinal > 60) {
        const diferencaSeg = Math.trunc(segundoFinal/60)
        const restoSeg = (segundoFinal / 60 - diferencaSeg) * 60
        minutoFinal = minutoFinal + diferencaSeg
        segundoFinal = Math.trunc(restoSeg)
    }
    document.getElementById("minutoFinal").textContent = minutoFinal
    document.getElementById("segundoFinal").textContent = segundoFinal
    clearInterval(intervalo)
    clearTimeout(respostaAutomatica)
    clearInterval(calcularTE)
    clearInterval(humorTempoEspera)
    clearInterval(repetirMensagem)
    modal.showModal()
}

function fecharModal () {
    window.location.reload()
}

// Botão para iniciar o atendimento
btn_iniciar_simul.addEventListener('click', iniciarAtendimento)

// Adicione um ouvinte de eventos para o botão de envio de mensagem
botaoEnviar.addEventListener('click', enviarMensagem)

// Botão para finalizar o atendimento
botaoFinalizar.addEventListener('click', finalizarAtendimento)

// Botão para atualizar a página após fechar o modal
botaoFecharModal.addEventListener('click', fecharModal)
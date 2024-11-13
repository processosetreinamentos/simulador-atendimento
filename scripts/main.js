// Importações
import { gerarResposta } from './adm_scripts.js'
import { aguardandoCalmo, aguardandoIrritado } from './clientes_scripts.js'

// Elementos do DOM
const chatContainer = document.getElementById('chat-container')
const userInput = document.getElementById('user-input')
const botaoEnviar = document.getElementById('enviar')
const divCliente = document.getElementById('div-box-cliente')
const timer = document.querySelector("#timeryt")
const botaoIniciaSimul = document.querySelector("#iniciar_simul")
const chatBox = document.querySelector(".container-css")
const audioNotif = new Audio('assets/audio/NotifySound.mp3')
const audioPop = new Audio('assets/audio/PopSound.mp3')
const botaoFinalizar = document.getElementById('finalizar')
const botaoTransferir = document.getElementById('transferencia')
const modal = document.getElementById('modal-encerrar')
const modalTransferir = document.getElementById('modal-transferir')
const botaoFecharAtend = document.getElementById('modal-button')
const botaoTransferirAtend = document.getElementById('modal-button2')
const botaoFechaModal = document.getElementById('cancel-button')

// Variáveis Globais
let contagemMensagens = 0
let ultimosTme = []
let dadosStatus
let contadorHumor = 0
const tipoStatus = ['CALMO', 'IRRITADO']
let statusAtual = tipoStatus[indiceAleatorio(tipoStatus)]; // Gerar indice aleatório
let tmpini = null
let minutoGlobal = 0
let segundoGlobal = 0
let minutoFinal = 0
let segundoFinal = 0
let intervalo = null

// Definição de Status do Cliente
const statusCliente = {
    CALMO: { nome: 'Calmo' },
    IRRITADO: { nome: 'Irritado' },
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
    
    function msgAguardando (status_select) {
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

    msgAguardando(statusAtual)
    audioPop.play()
    exibirMensagem(`Cliente (${dadosStatus.nome})`, mensagemAutomatica, 'cliente')
}

//Verifica a soma dos quatro últimos TMEs e atualiza o Status do cliente
function upgradeStatus() {
    let totalTempos = 0
                
    if (ultimosTme.length == 4) {
                    
        // Iterar sobre os valores em ULTIMOS_TME
        for (let tempo of Object.values(ultimosTme)) {
            totalTempos = totalTempos + tempo
        }
                    
        if ((totalTempos <= 45) & (statusAtual === tipoStatus[1])) {
            statusAtual = tipoStatus[0]
            dadosStatus = statusCliente.CALMO
            contadorHumor++
            document.getElementById("humorFinal").textContent = contadorHumor
            ultimosTme = []
            totalTempos = 0
        } else if ((totalTempos <= 45) & (statusAtual === tipoStatus[0])) {
            ultimosTme = []
            totalTempos = 0
        } else {
            ultimosTme = []
            totalTempos = 0
        }
    }
}
            
const contador = () => {
    const tmpAtual = Date.now()
    let cont = tmpAtual - tmpini
    let seg = Math.floor((cont)/1000)
    timer.innerHTML = converter(seg)
}
            
const converter = (seg) => {
    const hora = Math.floor(seg/3600)
    const resto = seg%3600
    const minuto = Math.floor(resto/60)
    const segundo = Math.floor(resto%60)
    const tempoFormatado = (hora < 10 ? "0" +hora:hora)+":"+(minuto < 10 ? "0" +minuto:minuto)+":"+(segundo < 10 ? "0" +segundo:segundo)
    minutoGlobal = minuto
    segundoGlobal = segundo
    return tempoFormatado
}

function repetirMensagem() {
    if (contagemMensagens >= 0 & minutoGlobal >= 2 & segundoGlobal == 50){
        respostaAutomatica()
    }
}

function limiteEspera() {
    if (minutoGlobal >= 3) {
        divCliente.classList.add('limite-atingido')
        divCliente.classList.remove('bg-white')
    } else {
        divCliente.classList.remove('limite-atingido')
        divCliente.classList.add('bg-white')
    }
}

// Função para verificar o tempo de resposta
function humorTempoEspera() {
    if (minutoGlobal >= 3 & segundoGlobal == 50) {
        if (statusAtual == tipoStatus[0]) {
            dadosStatus = statusCliente.IRRITADO
            statusAtual = tipoStatus[1]
            contadorHumor++
            document.getElementById("humorFinal").textContent = contadorHumor
        }
    }
}

// Função que adiciona um atraso usando Promise e setTimeout
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Função que lida com o envio da mensagem e exibe as respostas com atraso
async function enviarMensagem() {
    const mensagemUsuario = userInput.value.trim()
    
    if (mensagemUsuario) {
        exibirMensagem('Eu', mensagemUsuario, 'atendente')
        userInput.value = ''
        
        minutoFinal = minutoFinal + minutoGlobal
        segundoFinal = segundoFinal + segundoGlobal
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
        ultimosTme.push(minutoGlobal, segundoGlobal)
        upgradeStatus()
        
        // Obtém todas as respostas de uma vez
        const respostas = gerarResposta(mensagemUsuario);

        // Exibe cada resposta com um atraso de 15 segundos usando async/await
        for (let i = 0; i < respostas.length; i++) {
            const resposta = respostas[i];
            await delay(15000); // Espera 8 segundos antes de exibir a próxima resposta
            audioPop.play();
            exibirMensagem(`Cliente (${dadosStatus.nome})`, resposta, 'cliente');
        }
    }
}

function iniciarAtendimento() {
    audioNotif.play()
    tmpini = Date.now()
    intervalo = setInterval(contador, 1000)
    setTimeout(respostaAutomatica, 3000)
    setInterval(limiteEspera, 1000)
    setInterval(humorTempoEspera, 1000)
    setInterval(repetirMensagem, 1000)
    chatBox.style.display = 'grid'
    botaoIniciaSimul.style.display = 'none'
}

function finalizarAtendimento() {
    minutoFinal = minutoFinal + minutoGlobal
    segundoFinal = segundoFinal + segundoGlobal
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
    clearInterval(limiteEspera)
    clearInterval(humorTempoEspera)
    clearInterval(repetirMensagem)
    modal.showModal()
}

function encerrarAtend () {
    window.location.reload(true)
}

function transferirAtendimento() {
    modalTransferir.showModal()
}

function fecharModal() {
    modalTransferir.close()
}

// Botão para iniciar o atendimento
botaoIniciaSimul.addEventListener('click', iniciarAtendimento)

// Adicione um ouvinte de eventos para o botão de envio de mensagem
botaoEnviar.addEventListener('click', enviarMensagem)

// Botão para finalizar o atendimento
botaoFinalizar.addEventListener('click', finalizarAtendimento)

// Botão para transferir o atendimento
botaoTransferir.addEventListener('click', transferirAtendimento)

// Botão para atualizar a página após fechar o modal
botaoFecharAtend.addEventListener('click', encerrarAtend)
botaoTransferirAtend.addEventListener('click', encerrarAtend)
botaoFechaModal.addEventListener('click', fecharModal)

// Envie a mensagem apertando enter
document.addEventListener('keydown', function(e) {
    if(e.key == 'Enter') {
        document.getElementById('enviar').click();
    }
});

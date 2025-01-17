// 채팅 메시지를 추가하는 함수
function appendMessage(message, sender) {
    const chatBox = document.getElementById('chat-box');
    const messageDiv = document.createElement('div');
    messageDiv.className = sender === 'bot' ? 'bot-message' : 'user-message';
    messageDiv.textContent = message;
    chatBox.appendChild(messageDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
}

// 계약서 선택 시 처리하는 함수
function selectContract(selection) {
    let contractName = '';
    if (selection === '1') contractName = '부동산임대차계약서';
    else if (selection === '2') contractName = '위임장';
    else if (selection === '3') contractName = '소장';

    appendMessage(`선택: ${contractName}`, 'user');

    // 계약서 종류 선택 처리
    fetch('/select', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ selection: selection })
    })
    .then(response => response.json())
    .then(data => {
        appendMessage(data.message, 'bot');

        // 계약서 내용 생성 요청
        generateContractContent(selection);
    })
    .catch(() => {
        appendMessage('서버 오류가 발생했습니다. 다시 시도해주세요.', 'bot');
    });

    document.getElementById('button-options').style.display = 'none';
    document.getElementById('user-input').style.display = 'block';
}

// GPT API를 통해 계약서 내용을 생성하는 함수
function generateContractContent(selection) {
    appendMessage("계약서를 생성 중입니다. 잠시만 기다려 주세요...", 'bot');

    fetch('/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ selection: selection })
    })
    .then(response => response.json())
    .then(data => {
        if (data.contract) {
            appendMessage("생성된 계약서를 확인해 주세요:\n\n" + data.contract, 'bot');

            // 입력 항목 요청 추가
            requestInputFields(selection);
        } else {
            appendMessage("계약서 생성에 실패했습니다. 다시 시도해 주세요.", 'bot');
        }
    })
    .catch(() => {
        appendMessage("서버 오류가 발생했습니다. 다시 시도해 주세요.", 'bot');
    });
}

// 사용자 입력이 필요한 항목 요청 함수
function requestInputFields(selection) {
    appendMessage("작성에 필요한 항목을 확인 중입니다...", 'bot');

    fetch('/input-fields', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ selection: selection })
    })
    .then(response => response.json())
    .then(data => {
        if (data.message) {
            appendMessage(data.message, 'bot');
        } else {
            appendMessage("입력 항목 요청에 실패했습니다. 다시 시도해 주세요.", 'bot');
        }
    })
    .catch(() => {
        appendMessage("서버 오류가 발생했습니다. 다시 시도해 주세요.", 'bot');
    });
}

// 사용자 입력 전송 버튼 클릭 이벤트
document.getElementById('send-btn').addEventListener('click', function () {
    const message = document.getElementById('text-input').value.trim();

    if (message === '') return; // 빈 메시지 방지

    appendMessage(message, 'user');
    document.getElementById('text-input').value = '';
});

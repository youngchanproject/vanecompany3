from flask import Flask, send_from_directory, jsonify, request
from flask_cors import CORS
import os
import openai  # OpenAI 라이브러리 추가

# Flask 앱 생성 (frontend 폴더에서 정적 파일 제공)
app = Flask(__name__, static_folder='../frontend', static_url_path='/')
CORS(app)

os.environ["OPENAI_API_KEY"] = "sk-TiNSExMJ6UnI4dHEB7EBMUol2XnrRGHVL-D9iAMU87T3BlbkFJPqCaU5KoF6GdtDOPLqmS7yESy1Wea_jVvG7whDXIEA"

# 계약서 종류 딕셔너리
contract_types = {
    "1": "부동산임대차계약서",
    "2": "위임장",
    "3": "소장"
}

# 메인 페이지(index.html) 제공
@app.route('/')
def serve():
    return send_from_directory(app.static_folder + '/public', 'index.html')

# 정적 파일(css, js) 제공
@app.route('/<path:path>')
def static_files(path):
    return send_from_directory(app.static_folder, path)

# 계약서 종류 선택 처리
@app.route('/select', methods=['POST'])
def select():
    data = request.get_json()
    selection = data.get('selection')

    if selection in contract_types:
        response = f"선택하신 계약서는 '{contract_types[selection]}'입니다. 이어지는 계약서 예시 샘플을 확인해 주세요"
    else:
        response = "잘못된 선택입니다. 1, 2, 3 중에서 선택해 주세요."

    return jsonify({"message": response})

# GPT API를 통한 계약서 내용 생성
@app.route('/generate', methods=['POST'])
def generate_contract():
    data = request.get_json()
    selection = data.get('selection')

    if selection not in contract_types:
        return jsonify({"error": "잘못된 선택입니다. 1, 2, 3 중에서 선택해 주세요."})

    contract_type = contract_types[selection]
    prompt = f"'{contract_type}'의 표준 계약서를 작성해 주세요."

    try:
        # GPT API 호출 로그 추가
        print(f"GPT API 호출 프롬프트: {prompt}")
        # GPT API 호출
        response = openai.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You are a helpful assistant."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=1000,
            temperature=0.7
        )
        generated_text = response.choices[0].message.content.strip()

        # GPT 응답 확인
        print(f"GPT API 응답: {generated_text}")

        return jsonify({"contract": generated_text})

    except Exception as e:
        print(f"GPT API 호출 에러: {e}")
        return jsonify({"error": str(e)})

if __name__ == '__main__':
    app.run(debug=True)

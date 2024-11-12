async function recognize(base64, lang, options) {
  const { config, utils } = options;
  const { http, CryptoJS } = utils;
  const { fetch, Body } = http;

  const maxAttempts = 2;

  // 创建并行执行的 Promise 数组
  const attempts = [];
  for (let i = 0; i < maxAttempts; i++) {
    const attemptPromise = (async () => {
      try {
        const bodyObj = {
          images: [
            {
              data: base64,
              dataId: "1",
              type: 2
            }
          ],
          nonce: Math.floor(Math.random() * 100000),
          secretId: "Inner_40731a6efece4c2e992c0d670222e6da",
          timestamp: Date.now()
        };

        const body = JSON.stringify(bodyObj);
        const text = body + '43e7a66431b14c8f856a8e889070c19b';
        const sign = CryptoJS.MD5(text).toString();

        const headers = {
          'CX-Signature': sign,
          'Content-Type': 'application/json;charset=utf-8'
        };

        const response = await fetch('http://ai.chaoxing.com/api/v1/ocr/common/sync', {
          method: 'POST',
          headers: headers,
          body: Body.json(bodyObj),
          responseType: 1
        });

        if (response.ok) {
          const data = response.data;

          if (data && data.data && data.data[0]) {
            const textArray = data.data[0].map(item => item.text);
            const result = textArray.join('\n');
            return result;
          } else if (data && data.errorCode) {
            throw new Error(`接口返回错误，错误码：${data.errorCode}, 错误信息：${data.message}`);
          } else {
            throw new Error("返回数据格式不正确");
          }
        } else {
          throw new Error(`请求失败，状态码：${response.status}`);
        }
      } catch (error) {
        // 将错误重新抛出，以便在 Promise.any 中捕获
        throw error;
      }
    })();
    attempts.push(attemptPromise);
  }

  try {
    // 等待第一个成功的 Promise
    const result = await Promise.any(attempts);
    return result;
  } catch (errors) {
    // 所有尝试均失败
    throw new Error(`识别失败，共尝试 ${maxAttempts} 次。错误信息：${errors.errors.map(e => e.message).join('; ')}`);
  }
}

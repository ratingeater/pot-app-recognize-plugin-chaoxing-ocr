async function recognize(base64, lang, options) {
  const { config, utils } = options;
  const { http, CryptoJS } = utils;
  const { fetch, Body } = http;

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
      } else {
        throw new Error("返回数据格式不正确");
      }
    } else {
      console.error("请求失败，状态码：", response.status);
      console.error("响应内容：", response.data);
      throw new Error(`请求失败，状态码：${response.status}`);
    }
  } catch (error) {
    console.error("发生错误：", error);
    throw error;
  }
}
/**
 * KeyAuthClient - 网页版云注入客户端 SDK
 * 
 * 对齐 wlyz Node.js SDK (sdks/nodejs/index.js) 的签名算法：
 * - 签名原文：METHOD\nPATH\nTIMESTAMP\nNONCE\nBODY
 * - 签名算法：HMAC-SHA512/256（前32字节）
 * - 请求头：X-App-Key, X-Timestamp, X-Nonce, X-Signature
 */

export interface KeyAuthConfig {
  apiBase: string;      // 后端 API 地址，如 https://your-server.com
  appKey: string;       // 应用 AppKey（ak_ 开头）
  signSecret: string;   // 应用 SignSecret（明文）
}

export interface LoginResult {
  card_key: string;
  card_type: string;
  status: string;
  expires_at: number;
  bound_hardware: string;
  remaining_count: number;
}

export interface VarResult {
  var_key: string;
  var_value: string;
  var_type: string;
  updated_at: number;
}

export interface HeartbeatResult {
  online: boolean;
  last_heartbeat_at: number;
}

export interface NoticeResult {
  title: string;
  content: string;
  created_at: number;
}

export interface VersionResult {
  current_version: string;
  latest_version: string;
  has_update: boolean;
  download_url: string;
}

export class KeyAuthError extends Error {
  constructor(public code: number, message: string, public httpStatus: number = 0) {
    super(`[${code}] ${message}`);
    this.name = 'KeyAuthError';
  }
}

/**
 * HMAC-SHA512/256 签名（对齐 wlyz 后端）
 * 使用 Web Crypto API 实现
 */
async function hmacSha512_256Hex(secret: string, message: string): Promise<string> {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  
  // 导入 HMAC 密钥
  const key = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-512' },
    false,
    ['sign']
  );
  
  // 计算签名
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(message));
  
  // SHA-512/256 = SHA-512 前 32 字节（256 位）
  const signatureArray = new Uint8Array(signature);
  const truncated = signatureArray.slice(0, 32);
  
  // 转 64 位小写 hex
  return Array.from(truncated)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * 生成随机 nonce（32 字符 hex）
 */
function generateNonce(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
}

export class KeyAuthClient {
  private config: KeyAuthConfig;

  constructor(config: KeyAuthConfig) {
    this.config = config;
  }

  /**
   * 更新配置
   */
  updateConfig(config: Partial<KeyAuthConfig>) {
    this.config = { ...this.config, ...config };
  }

  /**
   * 登录（首次自动绑定设备）
   */
  async login(cardKey: string, hwid: string, opts?: { deviceName?: string; deviceType?: string }): Promise<LoginResult> {
    return this.post<LoginResult>('/api/v1/client/login', {
      card_key: cardKey,
      hwid,
      device_name: opts?.deviceName || '',
      device_type: opts?.deviceType || 'web',
    });
  }

  /**
   * 验证卡密有效性（不绑定，不增加使用次数）
   */
  async verify(cardKey: string, hwid: string): Promise<LoginResult> {
    return this.post<LoginResult>('/api/v1/client/verify', {
      card_key: cardKey,
      hwid,
    });
  }

  /**
   * 心跳保活
   */
  async heartbeat(cardKey: string, hwid: string): Promise<HeartbeatResult> {
    return this.post<HeartbeatResult>('/api/v1/client/heartbeat', {
      card_key: cardKey,
      hwid,
    });
  }

  /**
   * 获取云变量（核心注入接口）
   */
  async getVar(cardKey: string, varKey: string): Promise<VarResult> {
    return this.post<VarResult>('/api/v1/client/get_var', {
      card_key: cardKey,
      var_key: varKey,
    });
  }

  /**
   * 获取应用公告
   */
  async notice(): Promise<NoticeResult[]> {
    return this.post<NoticeResult[]>('/api/v1/client/notice', {});
  }

  /**
   * 检查版本更新
   */
  async version(currentVersion?: string, platform?: string): Promise<VersionResult> {
    return this.post<VersionResult>('/api/v1/client/version', {
      current_version: currentVersion || '',
      platform: platform || '',
    });
  }

  /**
   * 客户端登出
   */
  async logout(cardKey: string, hwid: string): Promise<void> {
    await this.post<void>('/api/v1/client/logout', {
      card_key: cardKey,
      hwid,
    });
  }

  /**
   * 核心请求方法
   */
  private async post<T>(path: string, payload: Record<string, unknown>): Promise<T> {
    const body = JSON.stringify(payload);
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const nonce = generateNonce();

    // 签名原文：METHOD\nPATH\nTIMESTAMP\nNONCE\nBODY
    const signString = ['POST', path, timestamp, nonce, body].join('\n');
    const signature = await hmacSha512_256Hex(this.config.signSecret, signString);

    const url = `${this.config.apiBase}${path}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-App-Key': this.config.appKey,
        'X-Timestamp': timestamp,
        'X-Nonce': nonce,
        'X-Signature': signature,
      },
      body,
    });

    const data = await response.json();

    if (data.code !== 0) {
      throw new KeyAuthError(data.code || 1006, data.message || '未知错误', response.status);
    }

    return data.data;
  }
}
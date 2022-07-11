export interface WalletProvider {
  isSomeOtherWallet?: boolean
  isCoinbaseWallet?: boolean
  isMetaMask?: boolean
  isStatus?: boolean
  host?: string
  path?: string
  sendAsync?: (
    request: { method: string; params?: Array<any> },
    callback: (error: any, response: any) => void
  ) => void
  send?: (
    request: { method: string; params?: Array<any> },
    callback: (error: any, response: any) => void
  ) => void
  request?: (request: { method: string; params?: Array<any> }) => Promise<any>
}

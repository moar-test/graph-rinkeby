/* eslint-disable prefer-const */ // to satisfy AS compiler

import { Mint, Redeem, LockValue, Transfer } from '../types/CProtection/cprotection'
import { CProtection } from '../types/schema'
import { Address, BigDecimal, BigInt, log, store } from '@graphprotocol/graph-ts'
import { ERC20 } from '../types/templates/CToken/ERC20'
import {
  exponentToBigDecimal,
  mantissaFactor,
  mantissaFactorBD,
  cTokenDecimalsBD,
  zeroBD,
} from './helpers'

export function handleCProtectionMinted(event: Mint): void {
  let underlyingAsset = ERC20.bind(event.params.asset)
  let cop = new CProtection(event.params.tokenId.toHexString())

  cop.tokenId = event.params.tokenId
  cop.underlyingTokenId = event.params.underlyingTokenId
  cop.underlyingAsset = event.params.asset
  cop.amount = event.params.amount
    .toBigDecimal()
    .div(exponentToBigDecimal(underlyingAsset.decimals()))

  cop.lockedValue = zeroBD
  cop.strike = event.params.strikePrice.toBigDecimal()
  cop.account = event.params.minter.toHexString()
  cop.expirationTimestamp = event.params.expirationTime
  cop.save()
}

export function handleCProtectionRedeemed(event: Redeem): void {
  store.remove('CProtection', event.params.tokenId.toHexString())
}

export function handleCProtectionLockedValueChanged(event: LockValue): void {
  let cop = CProtection.load(event.params.tokenId.toHexString())
  cop.lockedValue = event.params.optimizationValue
    .toBigDecimal()
    .div(exponentToBigDecimal(18))
  cop.save()
}

export function handleCProtectionTransfered(event: Transfer): void {
  let cop = CProtection.load(event.params.tokenId.toHexString())
  if (cop != null) {
    cop.account = event.params.to.toHexString()
    cop.save()
  }
}

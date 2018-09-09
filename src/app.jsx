import React, { Component } from 'react'
import { connect } from 'lotion'
import { Dimmer, Loader, Container, Grid } from 'semantic-ui-react'
import MenuBar from './menu'
import Wallet from './wallet'
import Vote from './vote'
import Bonds from './bonds'
import Airdrop from './airdrop'
import { nativeImage } from 'electron'

let logo = nativeImage.createFromPath('./Pillar.png')


class App extends Component {
  constructor (props) {
    super(props)

    this.state = {
      activeItem: 'wallet',
      address: '1234567890',
      balance: 3,
      bonds: 4,
      wallet: null,
      client: null,
      finalPrice: 0,
      supply: 0,
      connected: false
    }
  }

  componentDidMount () {
      this.getMyState()
        .then(async (client) => {
          setInterval(async () => {
            var wallets = await client.state.wallets
            var walletsMap = new Map()
            var address = 'ting'
            var balance = wallets.ting.balance
            var bonds = wallets.ting.bonds || 0
            var finalPrice = await client.state.finalPrice
            var supply = await client.state.supply
            this.setState({connected: true, client: client, address: address, balance: balance, bonds: bonds, finalPrice: finalPrice, supply: supply})
          }, 1000)
        })

  }

  async getMyState () {
    let { state, send } = await connect('66e968c68a6e845f94911190bccd096d9303a7a76185f8e9e46a266115e7b762')
    return {state, send}
  }

  handleItemClick (event, { name }) {
    this.setState({ activeItem: name })
  }

  sendTransaction (address, amount) {
    return new Promise ((resolve, reject) => {
      this.state.client.send({
        from: [
            // tx inputs. each must include an amount:
            {amount: Number(amount), type: 'coin', senderAddress: 'ting'}
        ],
        to: [
            // tx outputs. sum of amounts must equal sum of amounts of inputs.
            {amount: Number(amount), type: 'coin', receiverAddress: address}
        ]
      })
      .then(async (result) => {
        resolve()
      })
    })
  }

  buyBond (amount) {
    console.log('BUY BOND !')
    console.log('Amount :', amount)
    return new Promise ((resolve, reject) => {
      this.state.client.send({
        from: [
            // tx inputs. each must include an amount:
            {amount: Number(amount), type: 'bonds', senderAddress: 'ting'}
        ],
        to: [
            // tx outputs. sum of amounts must equal sum of amounts of inputs.
            {amount: Number(amount), type: 'bonds', receiverAddress: ''}
        ]
      })
      .then(async (result) => {
        resolve()
      })
    })
  }

  vote (stake, price) {
    console.log('VOTE !')

    return new Promise ((resolve, reject) => {
      this.state.client.send({
        from: [
            // tx inputs. each must include an amount:
            {amount: Number(stake), type: 'vote', price: Number(price), senderAddress: 'ting'}
        ],
        to: [
            // tx outputs. sum of amounts must equal sum of amounts of inputs.
            {amount: Number(stake), type: 'vote', price: Number(price)}
        ]
      })
      .then(async (result) => {
        resolve()
      })
    })
  }

  airdrop () {
    console.log('AIRDROP !')

    return new Promise ((resolve, reject) => {
      this.state.client.send({
        from: [
            // tx inputs. each must include an amount:
            { type: 'airdrop', senderAddress: 'ting'}
        ],
        to: [
            // tx outputs. sum of amounts must equal sum of amounts of inputs.
            { type: 'airdrop'}
        ]
      })
      .then(async (result) => {
        resolve()
      })
    })
  }

  getView () {
    switch (this.state.activeItem) {
      case 'wallet':
        return <Wallet sendTransaction={this.sendTransaction.bind(this)} address={this.state.address} balance={this.state.balance} />
      case 'vote':
        return <Vote vote={this.vote.bind(this)} price={this.state.finalPrice} />
      case 'bonds':
        return <Bonds bonds={this.state.bonds} buyBond={this.buyBond.bind(this)} />
      case 'airdrop':
        return <Airdrop supply={this.state.supply} airdrop={this.airdrop.bind(this)} />
      default:
        throw new Error('Unknown view')
    }
  }

  render () {
    return (
    this.state.connected ? <Grid style={{ fontSize: '18px', backgroundColor: 'rgba(55,62,68,1)', alignItems: 'center', justifyContent: 'center', background:'radial-gradient(55,62,68)' }}>
      <Grid.Column width={4}>
        <MenuBar handleItemClick={this.handleItemClick.bind(this)} activeItem={this.state.activeItem} finalPrice={this.state.finalPrice} />
      </Grid.Column>
      <Grid.Column  width={11} >
         {this.getView()}
      </Grid.Column>
    </Grid> : <Dimmer active><Loader indeterminate>Connecting</Loader></Dimmer> )
  }
}

export default App

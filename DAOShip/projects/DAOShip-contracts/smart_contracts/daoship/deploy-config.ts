import { AlgorandClient } from '@algorandfoundation/algokit-utils'
import { DaoshipFactory } from '../artifacts/daoship/DaoshipClient'

// Below is a showcase of various deployment options you can use in TypeScript Client
export async function deploy() {
  console.log('=== Deploying DAOShip DAO Contract ===')

  const algorand = AlgorandClient.fromEnvironment()
  const deployer = await algorand.account.fromEnvironment('DEPLOYER')

  const factory = algorand.client.getTypedAppFactory(DaoshipFactory, {
    defaultSender: deployer.addr,
  })

  // Deploy the contract with initial parameters
  const { appClient, result } = await factory.deploy({
    onUpdate: 'append',
    onSchemaBreak: 'append',
    // Initial global state values
    minVotingPower: 1000000, // 1 ALGO worth of voting power
    votingPeriod: 604800, // 7 days in seconds
    proposalCount: 0,
    proposalIds: []
  })

  // Fund the app account if it was just created
  if (['create', 'replace'].includes(result.operationPerformed)) {
    await algorand.send.payment({
      amount: (1).algo(),
      sender: deployer.addr,
      receiver: appClient.appAddress,
    })
  }

  console.log(
    `Successfully deployed DAOShip DAO Contract at ${appClient.appClient.appId}`,
  )

  // Create a test proposal
  try {
    const proposalId = await appClient.send.createProposal({
      args: { description: 'Test Proposal' },
    })
    console.log(`Created test proposal with ID: ${proposalId.return}`)
  } catch (error) {
    console.log('Could not create test proposal (expected if deployer has no voting power)')
  }
}

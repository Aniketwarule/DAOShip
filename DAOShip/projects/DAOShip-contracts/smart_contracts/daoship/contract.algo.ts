import { Contract, GlobalState, LocalState, Uint64, Address, bytes } from '@algorandfoundation/algorand-typescript'

// Proposal status enum
enum ProposalStatus {
  Active = 0,
  Passed = 1,
  Failed = 2,
  Executed = 3
}

// Proposal structure
interface Proposal {
  proposer: Address
  description: bytes
  startTime: Uint64
  endTime: Uint64
  yesVotes: Uint64
  noVotes: Uint64
  status: ProposalStatus
  executionTime: Uint64
}

export class Daoship extends Contract {
  // Global state
  @GlobalState
  minVotingPower: Uint64 = Uint64(1000000) // Minimum voting power required to create proposal

  @GlobalState
  votingPeriod: Uint64 = Uint64(604800) // 7 days in seconds

  @GlobalState
  proposalCount: Uint64 = Uint64(0)

  @GlobalState
  proposalIds: bytes[] = []

  // Local state for members
  @LocalState
  votingPower: Uint64 = Uint64(0)

  @LocalState
  hasVoted: boolean = false

  // Create a new proposal
  createProposal(description: bytes): Uint64 {
    // Check if sender has minimum voting power
    assert(this.votingPower >= this.minVotingPower, "Insufficient voting power")

    const currentTime = this.getCurrentTime()
    const endTime = currentTime + this.votingPeriod

    const proposal: Proposal = {
      proposer: this.txn.Sender,
      description: description,
      startTime: currentTime,
      endTime: endTime,
      yesVotes: Uint64(0),
      noVotes: Uint64(0),
      status: ProposalStatus.Active,
      executionTime: Uint64(0)
    }

    // Store proposal
    const proposalId = this.proposalCount
    this.proposalCount = this.proposalCount + Uint64(1)
    this.proposalIds.push(proposalId.toBytes())

    return proposalId
  }

  // Vote on a proposal
  vote(proposalId: Uint64, voteYes: boolean): void {
    // Check if proposal exists and is active
    assert(proposalId < this.proposalCount, "Invalid proposal ID")
    const proposal = this.getProposal(proposalId)
    assert(proposal.status === ProposalStatus.Active, "Proposal is not active")

    // Check if voting period is still active
    const currentTime = this.getCurrentTime()
    assert(currentTime <= proposal.endTime, "Voting period has ended")

    // Check if member has already voted
    assert(!this.hasVoted, "Already voted on this proposal")

    // Record vote
    if (voteYes) {
      proposal.yesVotes = proposal.yesVotes + this.votingPower
    } else {
      proposal.noVotes = proposal.noVotes + this.votingPower
    }

    this.hasVoted = true
  }

  // Execute a passed proposal
  executeProposal(proposalId: Uint64): void {
    // Check if proposal exists
    assert(proposalId < this.proposalCount, "Invalid proposal ID")
    const proposal = this.getProposal(proposalId)

    // Check if proposal has passed and not executed
    assert(proposal.status === ProposalStatus.Passed, "Proposal has not passed")
    assert(proposal.executionTime === Uint64(0), "Proposal already executed")

    // Execute proposal (implementation depends on specific proposal type)
    // For now, we'll just mark it as executed
    proposal.status = ProposalStatus.Executed
    proposal.executionTime = this.getCurrentTime()
  }

  // Finalize a proposal after voting period
  finalizeProposal(proposalId: Uint64): void {
    // Check if proposal exists
    assert(proposalId < this.proposalCount, "Invalid proposal ID")
    const proposal = this.getProposal(proposalId)

    // Check if voting period has ended
    const currentTime = this.getCurrentTime()
    assert(currentTime > proposal.endTime, "Voting period has not ended")

    // Check if proposal is still active
    assert(proposal.status === ProposalStatus.Active, "Proposal already finalized")

    // Determine if proposal passed (simple majority)
    if (proposal.yesVotes > proposal.noVotes) {
      proposal.status = ProposalStatus.Passed
    } else {
      proposal.status = ProposalStatus.Failed
    }
  }

  // Helper function to get current time
  private getCurrentTime(): Uint64 {
    return Uint64(this.txn.FirstValid)
  }

  // Helper function to get proposal by ID
  private getProposal(proposalId: Uint64): Proposal {
    // In a real implementation, this would retrieve the proposal from storage
    // For now, we'll return a mock proposal
    return {
      proposer: this.txn.Sender,
      description: bytes(""),
      startTime: Uint64(0),
      endTime: Uint64(0),
      yesVotes: Uint64(0),
      noVotes: Uint64(0),
      status: ProposalStatus.Active,
      executionTime: Uint64(0)
    }
  }
}

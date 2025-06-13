import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navigation from "@/components/navigation";
import Footer from "@/components/footer";
import GlassmorphicCard from "@/components/ui/glassmorphic-card";
import GlassmorphicInput from "@/components/ui/glassmorphic-input";
import GlassmorphicTextarea from "@/components/ui/glassmorphic-textarea";
import GlassmorphicSlider from "@/components/ui/glassmorphic-slider";
import GradientButton from "@/components/ui/gradient-button";
import { useToast } from "@/hooks/use-toast";
import { Upload } from "lucide-react";
import axios from "axios"; // Make sure axios is installed
import { useWallet } from "@/hooks/use-wallet";

const steps = [
  "Basic Information",
  "Governance Parameters",
  "Token Configuration",
  "Review & Submit",
];

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const CreateDAO = () => {
  const { isConnected, walletAddress } = useWallet();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    tokenName: "",
    tokenSymbol: "",
    tokenSupply: 1000000,
    votingPeriod: 7,
    quorum: 50,
    minTokens: 100,
    logo: null,
    logoPreview: "",
    votePrice: 1,
    // New GitHub-specific fields
    githubRepo: "",
    tokenStrategy: "fixed", // 'fixed' or 'dynamic'
    initialDistribution: {
      commits: 10,
      pullRequests: 50,
      issues: 20,
      codeReviews: 15,
    },
    tokenAllocation: {
      initialDistribution: 60, // percentage of total tokens for initial distribution
      futureContributors: 30, // percentage reserved for future contributors
      treasury: 10, // percentage for DAO treasury
    },
    contributionRewards: {
      newPR: 30,
      acceptedPR: 50,
      issueCreation: 20,
      codeReview: 15,
    },
    vestingPeriod: 30,
    minContributionForVoting: 100,
  });

  // Handle text input changes
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Handle logo upload
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();

      reader.onload = (event) => {
        if (event.target && typeof event.target.result === "string") {
          setFormData({
            ...formData,
            logo: file,
            logoPreview: event.target.result,
          });
        }
      };

      reader.readAsDataURL(file);
    }
  };

  // Create a new DAO using the API
  const createDAO = async (daoData) => {
    try {
      const response = await axios.post(`${API_URL}/dao`, daoData);
      return response.data;
    } catch (error) {
      console.error("API Error:", error);
      throw error;
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isConnected) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet to create a DAO",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch("/api/dao", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          manager: walletAddress,
          votePrice: formData.votePrice || 1,
        }),
      });

      if (!response.ok) throw new Error("Failed to create DAO");

      const dao = await response.json();
      toast({
        title: "Success",
        description: "DAO created successfully!",
      });
      navigate(`/dao/${dao._id}`);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create DAO. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Go to next step
  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  // Go to previous step
  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Render step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 0: // Basic Information
        return (
          <>
            <div className="space-y-6">
              <GlassmorphicInput
                label="DAO Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />

              <GlassmorphicTextarea
                label="Description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
              />

              <div>
                <p className="text-sm text-white/70 mb-2">Logo (Optional)</p>
                <div className="flex items-center space-x-4">
                  <div className="w-24 h-24 rounded-lg overflow-hidden glass-card flex items-center justify-center">
                    {formData.logoPreview ? (
                      <img
                        src={formData.logoPreview}
                        alt="DAO Logo Preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Upload className="h-8 w-8 text-white/50" />
                    )}
                  </div>
                  <div className="flex-1">
                    <input
                      type="file"
                      id="logo"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="hidden"
                    />
                    <label htmlFor="logo" className="cursor-pointer w-full">
                      <GradientButton
                        type="button"
                        variant="secondary"
                        className="w-full"
                      >
                        <Upload className="mr-2 h-4 w-4" />
                        {formData.logo ? "Change Logo" : "Upload Logo"}
                      </GradientButton>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </>
        );

      case 1: // Governance Parameters
        return (
          <div className="space-y-6">
            <GlassmorphicSlider
              label="Voting Period (Days)"
              min={1}
              max={30}
              value={formData.votingPeriod}
              onChange={(value) =>
                setFormData({ ...formData, votingPeriod: value })
              }
              unit=" days"
            />

            <GlassmorphicSlider
              label="Quorum Percentage"
              min={1}
              max={100}
              value={formData.quorum}
              onChange={(value) => setFormData({ ...formData, quorum: value })}
              unit="%"
            />

            <GlassmorphicInput
              label="Minimum Tokens to Participate"
              name="minTokens"
              type="number"
              value={formData.minTokens.toString()}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  minTokens: parseInt(e.target.value) || 0,
                })
              }
            />

            <div className="p-4 glass-card rounded-lg mt-6">
              <p className="text-sm text-daoship-text-gray">
                <span className="text-daoship-blue font-medium">Tip:</span> A
                higher quorum percentage ensures more community participation,
                but may make it harder to pass proposals.
              </p>
            </div>
          </div>
        );

      case 2: // Token Configuration
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <GlassmorphicInput
                label="Token Name"
                name="tokenName"
                value={formData.tokenName}
                onChange={handleChange}
                required
              />

              <GlassmorphicInput
                label="Token Symbol"
                name="tokenSymbol"
                value={formData.tokenSymbol}
                onChange={handleChange}
                maxLength={5}
                required
              />
            </div>

            <div className="p-4 glass-card rounded-lg">
              <h4 className="text-lg font-semibold text-white mb-4">Token Supply Strategy</h4>
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="tokenStrategy"
                      value="fixed"
                      checked={formData.tokenStrategy === "fixed"}
                      onChange={(e) => setFormData({
                        ...formData,
                        tokenStrategy: e.target.value
                      })}
                      className="form-radio text-daoship-blue"
                    />
                    <span className="text-white">Fixed Supply</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="tokenStrategy"
                      value="dynamic"
                      checked={formData.tokenStrategy === "dynamic"}
                      onChange={(e) => setFormData({
                        ...formData,
                        tokenStrategy: e.target.value
                      })}
                      className="form-radio text-daoship-blue"
                    />
                    <span className="text-white">Dynamic Supply</span>
                  </label>
                </div>

                {formData.tokenStrategy === "fixed" ? (
                  <div className="space-y-4">
                    <GlassmorphicInput
                      label="Total Token Supply"
                      name="tokenSupply"
                      type="number"
                      value={formData.tokenSupply}
                      onChange={(e) => setFormData({
                        ...formData,
                        tokenSupply: parseInt(e.target.value) || 0
                      })}
                      required
                    />

                    <div className="p-4 bg-white/5 rounded-lg">
                      <h5 className="text-white font-medium mb-2">Token Allocation</h5>
                      <div className="space-y-3">
                        <div>
                          <label className="text-sm text-white/70">Initial Distribution</label>
                          <GlassmorphicSlider
                            min={0}
                            max={100}
                            value={formData.tokenAllocation.initialDistribution}
                            onChange={(value) => setFormData({
                              ...formData,
                              tokenAllocation: {
                                ...formData.tokenAllocation,
                                initialDistribution: value
                              }
                            })}
                            unit="%"
                          />
                        </div>
                        <div>
                          <label className="text-sm text-white/70">Future Contributors</label>
                          <GlassmorphicSlider
                            min={0}
                            max={100}
                            value={formData.tokenAllocation.futureContributors}
                            onChange={(value) => setFormData({
                              ...formData,
                              tokenAllocation: {
                                ...formData.tokenAllocation,
                                futureContributors: value
                              }
                            })}
                            unit="%"
                          />
                        </div>
                        <div>
                          <label className="text-sm text-white/70">DAO Treasury</label>
                          <GlassmorphicSlider
                            min={0}
                            max={100}
                            value={formData.tokenAllocation.treasury}
                            onChange={(value) => setFormData({
                              ...formData,
                              tokenAllocation: {
                                ...formData.tokenAllocation,
                                treasury: value
                              }
                            })}
                            unit="%"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-white/5 rounded-lg">
                    <p className="text-sm text-white/70">
                      With dynamic supply, tokens will be minted for new contributions based on the reward rates below.
                      This allows for unlimited growth but requires careful management of inflation.
                    </p>
                  </div>
                )}
              </div>
            </div>

            <GlassmorphicInput
              label="GitHub Repository URL"
              name="githubRepo"
              value={formData.githubRepo}
              onChange={handleChange}
              placeholder="https://github.com/username/repo"
              required
            />

            <div className="p-4 glass-card rounded-lg">
              <h4 className="text-lg font-semibold text-white mb-4">Initial Token Distribution</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <GlassmorphicInput
                  label="Tokens per Commit"
                  name="initialDistribution.commits"
                  type="number"
                  value={formData.initialDistribution.commits}
                  onChange={(e) => setFormData({
                    ...formData,
                    initialDistribution: {
                      ...formData.initialDistribution,
                      commits: parseInt(e.target.value) || 0
                    }
                  })}
                />
                <GlassmorphicInput
                  label="Tokens per PR"
                  name="initialDistribution.pullRequests"
                  type="number"
                  value={formData.initialDistribution.pullRequests}
                  onChange={(e) => setFormData({
                    ...formData,
                    initialDistribution: {
                      ...formData.initialDistribution,
                      pullRequests: parseInt(e.target.value) || 0
                    }
                  })}
                />
                <GlassmorphicInput
                  label="Tokens per Issue"
                  name="initialDistribution.issues"
                  type="number"
                  value={formData.initialDistribution.issues}
                  onChange={(e) => setFormData({
                    ...formData,
                    initialDistribution: {
                      ...formData.initialDistribution,
                      issues: parseInt(e.target.value) || 0
                    }
                  })}
                />
                <GlassmorphicInput
                  label="Tokens per Code Review"
                  name="initialDistribution.codeReviews"
                  type="number"
                  value={formData.initialDistribution.codeReviews}
                  onChange={(e) => setFormData({
                    ...formData,
                    initialDistribution: {
                      ...formData.initialDistribution,
                      codeReviews: parseInt(e.target.value) || 0
                    }
                  })}
                />
              </div>
            </div>

            <div className="p-4 glass-card rounded-lg">
              <h4 className="text-lg font-semibold text-white mb-4">Ongoing Contribution Rewards</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <GlassmorphicInput
                  label="New PR Reward"
                  name="contributionRewards.newPR"
                  type="number"
                  value={formData.contributionRewards.newPR}
                  onChange={(e) => setFormData({
                    ...formData,
                    contributionRewards: {
                      ...formData.contributionRewards,
                      newPR: parseInt(e.target.value) || 0
                    }
                  })}
                />
                <GlassmorphicInput
                  label="Accepted PR Reward"
                  name="contributionRewards.acceptedPR"
                  type="number"
                  value={formData.contributionRewards.acceptedPR}
                  onChange={(e) => setFormData({
                    ...formData,
                    contributionRewards: {
                      ...formData.contributionRewards,
                      acceptedPR: parseInt(e.target.value) || 0
                    }
                  })}
                />
                <GlassmorphicInput
                  label="Issue Creation Reward"
                  name="contributionRewards.issueCreation"
                  type="number"
                  value={formData.contributionRewards.issueCreation}
                  onChange={(e) => setFormData({
                    ...formData,
                    contributionRewards: {
                      ...formData.contributionRewards,
                      issueCreation: parseInt(e.target.value) || 0
                    }
                  })}
                />
                <GlassmorphicInput
                  label="Code Review Reward"
                  name="contributionRewards.codeReview"
                  type="number"
                  value={formData.contributionRewards.codeReview}
                  onChange={(e) => setFormData({
                    ...formData,
                    contributionRewards: {
                      ...formData.contributionRewards,
                      codeReview: parseInt(e.target.value) || 0
                    }
                  })}
                />
              </div>
            </div>

            <div className="p-4 glass-card rounded-lg">
              <h4 className="text-lg font-semibold text-white mb-4">Voting Parameters</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <GlassmorphicInput
                  label="Vesting Period (days)"
                  name="vestingPeriod"
                  type="number"
                  value={formData.vestingPeriod}
                  onChange={(e) => setFormData({
                    ...formData,
                    vestingPeriod: parseInt(e.target.value) || 0
                  })}
                />
                <GlassmorphicInput
                  label="Minimum Tokens for Voting"
                  name="minContributionForVoting"
                  type="number"
                  value={formData.minContributionForVoting}
                  onChange={(e) => setFormData({
                    ...formData,
                    minContributionForVoting: parseInt(e.target.value) || 0
                  })}
                />
              </div>
            </div>

            <div className="p-4 glass-card rounded-lg mt-6">
              <p className="text-sm text-daoship-text-gray">
                <span className="text-daoship-blue font-medium">Note:</span>{" "}
                Tokens will be distributed based on GitHub contributions. New contributors will need to complete the vesting period before they can vote.
              </p>
            </div>
          </div>
        );

      case 3: // Review & Submit
        return (
          <div className="space-y-6">
            <GlassmorphicCard className="p-6">
              <h3 className="text-xl font-semibold text-white mb-4">
                Review DAO Details
              </h3>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2">
                  <div>
                    <p className="text-sm text-white/60">DAO Name</p>
                    <p className="text-white">
                      {formData.name || "Not specified"}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-white/60">Token</p>
                    <p className="text-white">
                      {formData.tokenName} ({formData.tokenSymbol})
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-white/60">Token Supply</p>
                    <p className="text-white">
                      {formData.tokenSupply.toLocaleString()}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-white/60">Voting Period</p>
                    <p className="text-white">{formData.votingPeriod} days</p>
                  </div>

                  <div>
                    <p className="text-sm text-white/60">Quorum</p>
                    <p className="text-white">{formData.quorum}%</p>
                  </div>

                  <div>
                    <p className="text-sm text-white/60">Minimum Tokens</p>
                    <p className="text-white">
                      {formData.minTokens.toLocaleString()}
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-white/60">Description</p>
                  <p className="text-white">
                    {formData.description || "No description provided"}
                  </p>
                </div>

                {formData.logoPreview && (
                  <div>
                    <p className="text-sm text-white/60">Logo</p>
                    <img
                      src={formData.logoPreview}
                      alt="DAO Logo"
                      className="w-16 h-16 rounded-lg mt-2 object-cover"
                    />
                  </div>
                )}
              </div>
            </GlassmorphicCard>

            <div className="p-4 glass-card rounded-lg mt-2">
              <p className="text-sm text-daoship-text-gray">
                <span className="text-daoship-mint font-medium">
                  Ready to launch!
                </span>{" "}
                By submitting, you'll deploy this DAO to the Algorand
                blockchain. This action is irreversible.
              </p>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-background">
      <Navigation />

      <main className="pt-24 pb-20">
        <div className="container mx-auto px-4 max-w-3xl">
          <h1 className="text-3xl md:text-4xl font-bold mb-10 text-center gradient-text">
            Create Your DAO
          </h1>

          {/* Steps Progress */}
          <div className="mb-10">
            <div className="flex justify-between relative">
              {steps.map((step, index) => (
                <div
                  key={index}
                  className="flex flex-col items-center relative z-10"
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      index <= currentStep
                        ? "bg-gradient-primary"
                        : "bg-white/10"
                    }`}
                  >
                    <span className="text-white font-medium">{index + 1}</span>
                  </div>
                  <p
                    className={`text-xs mt-2 ${
                      index <= currentStep ? "text-white" : "text-white/50"
                    }`}
                  >
                    {step}
                  </p>
                </div>
              ))}

              {/* Progress Line */}
              <div className="absolute top-5 left-0 right-0 h-0.5 -translate-y-1/2 bg-white/10">
                <div
                  className="h-full bg-gradient-primary transition-all duration-300"
                  style={{
                    width: `${(currentStep / (steps.length - 1)) * 100}%`,
                  }}
                ></div>
              </div>
            </div>
          </div>

          {/* Form */}
          <GlassmorphicCard className="p-8" glowEffect>
            <form onSubmit={handleSubmit}>
              {renderStepContent()}

              <div className="flex justify-between mt-10">
                <GradientButton
                  type="button"
                  variant="secondary"
                  onClick={prevStep}
                  className={currentStep === 0 ? "invisible" : ""}
                >
                  Back
                </GradientButton>

                {currentStep < steps.length - 1 ? (
                  <GradientButton type="button" onClick={nextStep}>
                    Continue
                  </GradientButton>
                ) : (
                  <GradientButton
                    type="submit"
                    disabled={isSubmitting}
                    variant="success"
                    glowEffect
                  >
                    {isSubmitting ? "Creating DAO..." : "Create DAO"}
                  </GradientButton>
                )}
              </div>
            </form>
          </GlassmorphicCard>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default CreateDAO;

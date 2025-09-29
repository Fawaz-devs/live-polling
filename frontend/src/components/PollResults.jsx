const PollResults = ({ results }) => {
  if (!results) return null

  const { question, options, results: votes, totalAnswers, totalStudents } = results

  const maxVotes = Math.max(...Object.values(votes))

  return (
    <div className="card">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-[#373737]">Question 1</h3>
          <span className="text-sm text-red-500 font-medium">⏱ 00:15</span>
        </div>

        <div className="question-header">
          <p className="font-medium">{question}</p>
        </div>
      </div>

      <div className="space-y-4 mb-6">
        {options.map((option, index) => {
          const voteCount = votes[option] || 0
          const percentage = totalAnswers > 0 ? (voteCount / totalAnswers) * 100 : 0
          const isHighest = voteCount === maxVotes && maxVotes > 0

          return (
            <div key={index} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-4 h-4 rounded-full bg-[#7B60DA]" />
                  <span className="font-medium text-[#373737]">{option}</span>
                </div>
                <span className="text-sm font-medium text-[#373737]">{percentage.toFixed(0)}%</span>
              </div>

              <div className="w-full bg-[#F2F2F2] rounded-lg h-3">
                <div className="poll-result-bar h-3" style={{ width: `${percentage}%` }} />
              </div>
            </div>
          )
        })}
      </div>

      <div className="text-center pt-4 border-t border-[#E5E7EB]">
        <p className="text-[#A6A6A6] text-sm">Wait for the teacher to ask a new question.</p>
      </div>
    </div>
  )
}

export default PollResults

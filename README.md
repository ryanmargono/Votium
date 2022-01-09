How to use:

1. Open Votium and Snapshot in two different tabs.
2. Open your browser's dev tools in both tabs (Firefox = option + command + l)
3. On the Votium tab paste in the console:

```
const scrapeVotium = () => {
    const getPoolName = bribe => {
        const titles = bribe.getElementsByClassName("MuiTypography-root jss215 MuiTypography-body1")
        return titles[0].innerText.split(`"`)[1]
    }

    const getReward = bribe => {
        const price = bribe.getElementsByClassName("MuiTableCell-root MuiTableCell-body MuiTableCell-alignRight")[1].innerText
        const strippedPrice = price.substring(1).replaceAll(',', '')
        return parseFloat(strippedPrice)
    }

    const bribes = Array.from(document.getElementsByClassName("MuiPaper-root jss202 MuiPaper-elevation1 MuiPaper-rounded"))
        .map(bribe => ({ pool: getPoolName(bribe), reward: getReward(bribe) }))
        .reduce((res, bribe) => {
            res[bribe.pool] = (res[bribe.pool] || 0) + bribe.reward
            return res
        }, {})

    console.log(JSON.stringify(bribes))
}

scrapeVotium()
```

4. A result should be printed in the console, ie:

```
{"ousd":802945.5,"cvxcrv":1917643.55,"3eur":516796.03,"cvxeth":1180500,"musd":55439.99,"usdp":65000,"ust-wormhole":2566049.2,"rai":290211.18,"d3pool":187166.12,"aleth":491980,"mim-ust":1305514,"frax":7050020.68,"alusd":578800}
```

5. On the Snapshot tab pate in the console:

```
const calculateRewards = (votiumData, ownedVlCvxCount) => {

    const scrapeSnapshot = () => {
        const getPoolName = reward => reward.getElementsByClassName("mr-1")[0].innerText

        const getVoteCount = reward => {
            const count = reward.getElementsByClassName("inline-block")[0].innerText.split(' ')[0]
            const suffix = count[count.length-1]

            if (suffix === 'm') {
                return parseFloat(count.substring(0, count.length-1)) * 1000000
            } else if (suffix === 'k')
                return parseFloat(count.substring(0, count.length-1)) * 1000
            return parseFloat(count)
        }

        return Array.from(document.getElementsByClassName("link-color mb-1"))
            .map(reward => ({pool: getPoolName(reward), voteCount: getVoteCount(reward)}))
    }

    const snapshotData = scrapeSnapshot()

    const incentivizedPools = snapshotData.filter(sData => !!votiumData[sData.pool])
        .map(sData => ({...sData, reward: votiumData[sData.pool] }))

    incentivizedPools.map(p => ({...p, payout: (p.reward / (p.voteCount + ownedVlCvxCount)) * ownedVlCvxCount}))
        .sort((a,b) => a.payout < b.payout)
        .forEach(p => console.log(`${p.pool}: ${p.payout}`))
}
```

6. Run the function in the console with the following method signature: `calculateRewards(outputDataFromVotiumScript, yourOwnedVlCvxCount)`

```
calculateRewards({"ousd":802945.5,"cvxcrv":1917643.55,"3eur":516796.03,"cvxeth":1180500,"musd":55439.99,"usdp":65000,"ust-wormhole":2566049.2,"rai":290211.18,"d3pool":187166.12,"aleth":491980,"mim-ust":1305514,"frax":7050020.68,"alusd":578800}, 1517.08)
```

7. You should see a list of your total rewards in descending order in the Snapshot console.

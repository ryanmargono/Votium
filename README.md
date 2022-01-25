How to use:

1. Open Votium and Snapshot in two different tabs.
2. Open your browser's dev tools in both tabs (Firefox = option + command + l)
3. On the Votium tab paste in the console:

```
const scrapeVotium = () => {
    const getPoolName = bribe => {
        const titles = bribe.getElementsByClassName("MuiTypography-root MuiTypography-body1")
        return titles[0].innerText.split(`"`)[1]
    }

    const getReward = bribe => {
        const price = bribe.getElementsByClassName("MuiTableCell-root MuiTableCell-body MuiTableCell-alignRight")[1].innerText
        const strippedPrice = price.substring(1).replaceAll(',', '')
        return parseFloat(strippedPrice)
    }

    const bribes = Array.from(document.getElementsByClassName("MuiPaper-root"))
        .slice(2)
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
const calculateRewards = (ownedVlCvxCount, votiumData) => {

    const scrapeSnapshot = () => {
        const getPoolName = reward => reward.getElementsByClassName("mr-1")[0].innerText

        const getVoteCount = reward => {
            const count = reward.getElementsByClassName("inline-block")[0].innerText.split(' ')[0]
            const suffix = count[count.length-1]

            if (suffix === 'm' || suffix === 'M') {
                return parseFloat(count.substring(0, count.length-1)) * 1000000
            } else if (suffix === 'k' || suffix === 'K')
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
calculateRewards(1517.08, {"ousd":544610.5,"3eur":290049.75,"cvxcrv":1334880,"cvxeth":834300,"rai":130687.2,"ust-wormhole":4287624.12,"steth":385000,"mim-ust":536226.51,"d3pool":423866.96,"alusd":314640,"aleth":267444,"frax":6156955.6,"teth":301381.5})
```

7. You should see a list of your total rewards in descending order in the Snapshot console.

```
musd: 1692.3911833290806
d3pool: 1551.981357210117
ust-wormhole: 1414.820190880298
3eur: 1377.076864890655
cvxcrv: 1352.1708490615374
cvxeth: 1345.0168735349605
rai: 1330.1835737950857
usdp: 1323.8564325517928
aleth: 1299.0858978153333
ousd: 1286.0934947981384
mim-ust: 1284.8181864582386
alusd: 1278.914109481932
frax: 1182.9259712258818
```

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

calculateRewards(1517.08, {"ousd":544610.5,"3eur":290049.75,"cvxcrv":1334880,"cvxeth":834300,"rai":130687.2,"ust-wormhole":4287624.12,"steth":385000,"mim-ust":536226.51,"d3pool":423866.96,"alusd":314640,"aleth":267444,"frax":6156955.6,"teth":301381.5})
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
        const getPoolName = reward => reward.getElementsByTagName("span")[0].innerText

        const getVoteCount = reward => {
            const count = reward.getElementsByTagName("span")[1].innerText.split(' ')[0]
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

        console.log(incentivizedPools)
    
    incentivizedPools.map(p => ({...p, payout: (p.reward / (p.voteCount + ownedVlCvxCount)) * ownedVlCvxCount}))
        .sort((a,b) => a.payout < b.payout)
        .forEach(p => console.log(`${p.pool}: ${p.payout}`))
}

const data = {"ust-wormhole":4401940,"musd":41940.59,"cvxcrv":1332118.78,"cvxeth":831900,"alusd":516124,"aleth":331794,"d3pool":417533.02,"3eur":389787,"steth":547500,"frax":7060275.92,"rai":162262.8,"teth":401812.14,"mim-ust":454590.65}
calculateRewards(1517.08, data)
var algorithm = (function () {

    /**
     * @param resistances - array of integers adjusted to initial threshold
     * @param budgets - array of integers
     * @returns {deltas} - array of arrays of integers
     */
    function calculateAllocation(resistances, budgets) {
        var n = resistances.length;
        var dpTable = [initializeFirstRow(resistances, n)]; // in t,k - store partial solution (list of n resistances - one per person)

        for (var t = 1; t <= n; t++) {
            var row = [];
            for (var k = 0; k < n; k++) {
                var elementK = computeDpTableEntry(t, k);
                row.push(elementK);
            }
            dpTable.push(row);
        }
        var deltas = computeDeltas(dpTable, n);

        console.log(dpTable);
        console.log(deltas);
        return deltas;

        function computeDeltas(table, n) {
            var list = table[n - 1];
            var deltas = [];
            for (var i = 0; i < list.length; i++) {
                var item = list[i];
                if (item.budget >= 0) {
                    subCompute(item.list, item.bestIndex);
                    break;
                }
            }
            return deltas.reverse();

            function subCompute(list, bestIndex) {
                for (var t = n - 2; t >= 0; t--) {
                    var listPrev = table[t][bestIndex].list;
                    var deltaT = computeDeltaForT(list, listPrev);
                    deltas.push(deltaT);

                    list = listPrev;
                    bestIndex = table[t][bestIndex].bestIndex;
                }
            }

            function computeDeltaForT(list, listPrev) {
                var minLen = list.length;
                var deltas = [];
                for (var i = 0; i < n - minLen; i++) {
                    deltas.push(0);
                }
                var j = listPrev.length - minLen;
                for (i = 0; i < minLen; i++) {
                    deltas.push(list[i] - listPrev[j]);
                    j++;
                }
                return deltas;
            }
        }

        function initializeFirstRow(data, n) {
            var row = [];
            for (var i = 0; i < n; i++) {
                row.push({budget: -1, list: [], bestIndex: 0});
            }
            data = data.sort(function (a, b) {
                return a - b;
            });
            row[0] = ({budget: 0, list: data, bestIndex: 0});
            return row;
        }

        function computeDpTableEntry(t, k) {
            var bestRemainingBudget = -1, bestPrevK = 0;
            var bestRemainingBudgetList = [];
            for (var prevK = 0; prevK <= k; prevK++) {
                var prevBudget = dpTable[t - 1][prevK].budget;
                if (prevBudget < 0) {
                    continue;
                }
                var prevList = dpTable[t - 1][prevK].list;

                var index = _.findIndex(prevList, function (a) {
                    return a >= prevK;
                });
                var prefix = [], suffix = [];
                if (index == -1) {
                    prefix = prevList.slice(0);
                    suffix = [];
                } else {
                    prefix = prevList.slice(0).splice(0, index);
                    suffix = prevList.slice(0).splice(index, prevList.length);
                }

                var accumulate = 0;
                prefix.reverse();
                for (var i = 0; i < prefix.length - k + prevK; i++) {
                    accumulate += prevK - prefix[i];
                }
                var remainingBudget = budgets[t - 1] + prevBudget - accumulate;
                if (remainingBudget >= bestRemainingBudget) {
                    bestRemainingBudget = remainingBudget;
                    bestPrevK = prevK;
                    bestRemainingBudgetList = [];
                    for (i = 0; i < prefix.length - k + prevK; i++) {
                        bestRemainingBudgetList.push(prevK);
                    }
                    bestRemainingBudgetList = bestRemainingBudgetList.slice(0).concat(suffix);
                }
            }
            return {budget: bestRemainingBudget,
                list: bestRemainingBudgetList,
                bestIndex: bestPrevK};
        }
    }

    return {
        calculateAllocation: calculateAllocation
    };
})();

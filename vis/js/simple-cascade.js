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
            // retrieve DP table entries for last time point 
			var list = table[n - 1];
            var deltas = [];
			var stop = 0;
            for (var k  = 0; k < list.length; k++) {
				for (var prevK = 0; prevK <= k; prevK++) {	
					var item = list[k][prevK];
					if (item.budget >= 0) {
						subCompute(item.list, item.bestIndex, prevK);
						stop = 1;
						break;						
					}
				}
				if (stop == 1) {
					break;
				}
			}
            return deltas.reverse();

            function subCompute(list, bestIndex, bestPrevIndex) {
				var listPrev = [];
				var deltaT = [];
				//var bestPrevIndex = 0;
				// compute allocation of budget backwards in time
                for (var t = n - 2; t >= 0; t--) {
					// find one previous threshold which leads to optimal threshold in time t
					listPrev = table[t][bestIndex][bestPrevIndex].list;
					deltaT = computeDeltaForT(list, listPrev);
					deltas.push(deltaT);

                    list = listPrev;
					bestIndex = bestPrevIndex;
					bestPrevIndex = table[t][bestIndex][bestPrevIndex].bestIndex;
					//bestIndex = bestPrevIndex;
                }
            }

            function computeDeltaForT(list, listPrev) {
                var minLen = list.length;
                var deltasForT = [];
                for (var i = 0; i < n - minLen; i++) {
                    deltasForT.push(0);
                }
                var j = listPrev.length - minLen;
                for (i = 0; i < minLen; i++) {
                    deltasForT.push(list[i] - listPrev[j]);
                    j++;
                }
                return deltasForT;
            }
        }

        function initializeFirstRow(data, n) {
            var row = [];
			var element = [];
            for (var i = 0; i < n; i++) {
				element = [];
				for (var j = 0; j <= i; j++) {
					element.push({budget: -1, list: [], bestIndex: 0});
				}
                row.push(element);
            }
            data = data.sort(function (a, b) {
               return a - b;
            });
            row[0][0] = ({budget: 0, list: data, bestIndex: 0});
            return row;
        }
		
        function computeDpTableEntry(t, k) {
			var element = [];
			for (var smallK = 0; smallK <= k; smallK++) {
				var bestRemainingBudget = -1, bestPrevK = 0;
				var bestRemainingResistancesList = [];
				for (var prevK = 0; prevK <= smallK; prevK++) {
					/*if (t==4 && k == 15 && smallK == 15 && prevK == 8) {
						var kitty = 1;
					}*/
				
					var prevBudget = dpTable[t - 1][smallK][prevK].budget;
					if (prevBudget < 0) {
						continue;
					}
					var prevList = dpTable[t - 1][smallK][prevK].list;

					var index = _.findIndex(prevList, function (a) {
						return a >= smallK;
					});
					
					// prefix contains all items with threshold < smallK
					// suffix contains all items with threshold >= smallK
					var prefix = [], suffix = [];
					if (index == -1) {
						prefix = prevList.slice(0);
						suffix = [];
					} else {
						prefix = prevList.slice(0).splice(0, index);
						suffix = prevList.slice(0).splice(index, prevList.length);
					}

					var accumulate = 0;
					// reverse list to have smaller resistances first
					prefix.reverse();
					// k-smallK items need to get infected, this many need to be pushed to resistance smallK
					for (var i = 0; i < prefix.length - k + smallK; i++) {
						accumulate += smallK - prefix[i];
					}
					var remainingBudget = budgets[t - 1] + prevBudget - accumulate;
					if (remainingBudget >= bestRemainingBudget) {
						bestRemainingBudget = remainingBudget;
						bestPrevK = prevK;
						bestRemainingResistancesList = [];
						for (i = 0; i < prefix.length - k + smallK; i++) {
							bestRemainingResistancesList.push(smallK);
						}
						bestRemainingResistancesList = bestRemainingResistancesList.slice(0).concat(suffix);
					}
				}
				element.push({budget: bestRemainingBudget,
                list: bestRemainingResistancesList,
                bestIndex: bestPrevK});
			}
			return element;
        }
    }

    return {
        calculateAllocation: calculateAllocation
    };
})();

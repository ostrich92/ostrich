/**
 * @fileoverview
 * DataUtil에 관련된 Class 정의 
 */

if ( !Eco.getBeforeKey)
{
	/*
	 * Insert 순서 대로 key 문자열 생성하는 처리를 위해 함수들이다.
	 * 기존대로 0, 1, 2, 3 으로 key 생성하면 0, 1 사이에 insert되면, insert된 key는 1이고 이후 key들은 하나씩 증가해야 한다. 
	 * 만약 10만건에 대하여 1에 insert를 하면 이후 건에 대한 key변경을 해야 한다.
	 * 여기에 처리되는 함수들은 그 처리 없이 insert 순서대로 발생한다. 
	 * 하나도 없을 경우에 대한 최초 key는 "1" 값을 구성한다.
	 * 참조 사이트 => http://www.codeproject.com/Articles/453077/Generating-Keys-for-a-Custom-Sort-Order
	*/
	var membernames = {
		/**
		 * number and alphabet character code에 대한 순서값을 가지는 map정보.
		 * charvalue값 => ['0','1','2','3','4','5','6','7','8','9','a','b','c','d', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z']
		 * @private
		 * @constant
		 * @memberOf Eco
		 */
		_rangeCharIndex: {"48": 0, "49": 1, "50": 2, "51": 3, "52": 4, "53": 5, "54": 6, "55": 7, "56": 8, "57": 9, "97": 10,
									"98": 11, "99": 12, "100": 13, "101": 14, "102": 15, "103": 16, "104": 17, "105": 18, "106": 19, "107": 20,
									"108": 21, "109": 22, "110": 23, "111": 24, "112": 25, "113": 26, "114": 27, "115": 28, "116": 29, "117": 30,
									"118": 31, "119": 32, "120": 33, "121": 34, "122": 35},
		/**
		 * 주어진 key문자열을 charcode array로 반환한다.(유효성 처리 후에)
		 * @private
		 * @param {string} key
		 * @return {boolean|array} 주어진 key값이 유효하지 않으면 false, 유효하다면 charcode array
		 * @memberOf Eco
		 */	
		 _getCharCodeArr: function(key)
		{
			if ( !key || !key.length )
			{
				return false;
			}
			var c, result = [];
			for ( var i = 0, len = key.length ; i < len ; i++ )
			{
				c = key.charCodeAt(i);
				result[i] = c;
			}
			if ( result[result.length - 1] == 48 )
			{
				return false;
			}
			return result;
		},
		/**
		 * 주어진 charcode array에서 3만큼 주어진 c값을 charcode array에 추가한다.
		 * @private
		 * @param {array} charcodeArr 확장할 charcode array
		 * @param {number} c charcode array에 추가되는 charcode값
		 * @memberOf Eco
		 */	
		 _expand: function(charcodeArr, c)
		{
			var expandBy = 3, arrLen = charcodeArr.length;
			for ( var i = 0, len = expandBy - 1; i < len  ; ++i )
			{
				charcodeArr[arrLen] = c;
				arrLen++;
			}
			if ( c == 48 )
			{
				++c;
			}
			charcodeArr[charcodeArr.length] = c;
		},
		/**
		 * 주어진 key문자열의 순서가 이전에 해당하는 key 문자열을 반환한다.
		 * @param {string} curKey
		 * @param {boolean=} isRetChrArr false 문자열로 반환할 것인지, true이면 charcode array로 반환할 것인지을 구분한다.(default: false) 
		 * @return {string|array} 주어진 key문자열의 순서가 이전에 해당하는 key
		 * @memberOf Eco
		 */	
		getBeforeKey: function(curKey, isRetChrArr)
		{
			var charCodeArr;
			if ( !this.isArray(curKey) )
			{
				if ( !(charCodeArr = this._getCharCodeArr(curKey)) )
				{
					Eco.Logger.error("invalid key value!");
				}
			}
			else
			{
				charCodeArr = curKey.slice(0);
			}
			var at = charCodeArr.length - 1;
			var c = charCodeArr[at],
				min = 48,
				max = 122;
			if ( c > min + 1 )
			{
				--c;
				if ( c == 96 ) c = 57;
				charCodeArr[at] = c;
				if ( isRetChrArr )
				{
					return charCodeArr;
				}
				return String.fromCharCode.apply(null, charCodeArr);
			}
			while (at > 0)
			{
				charCodeArr[at] = max;
				--at;
				c = charCodeArr[at];
				if (c > min)
				{
					--c;
					if ( c == 96 ) c = 57;
					charCodeArr[at] = c;
					if ( isRetChrArr )
					{
						return charCodeArr;
					}
					return String.fromCharCode.apply(null, charCodeArr);
				}
			}
			for ( var i = 0, len = charCodeArr.length ; i < len ; i++ )
			{
				charCodeArr[i] = min;
			}
			this._expand(charCodeArr, max);
			if ( isRetChrArr )
			{
				return charCodeArr;
			}
			return String.fromCharCode.apply(null, charCodeArr);
		},
		/**
		 * 주어진 key문자열의 순서가 이후에 해당하는 key 문자열을 반환한다.
		 * @param {string} curKey
		 * @param {boolean=} isRetChrArr false 문자열로 반환할 것인지, true이면 charcode array로 반환할 것인지을 구분한다.(default: false) 
		 * @return {string|array} 주어진 key문자열의 순서가 이후에 해당하는 key
		 * @memberOf Eco
		 */	
		getAfterKey: function(curKey, isRetChrArr)
		{
			var charCodeArr;
			if ( !this.isArray(curKey) )
			{
				if ( !(charCodeArr = this._getCharCodeArr(curKey)) )
				{
					Eco.Logger.error("invalid key value!");
				}
			}
			else
			{
				charCodeArr = curKey.slice(0);
			}
			var at = charCodeArr.length-1;
			var min = 48,
				minCharToUse = min+1,
				max = 122;
			var c;
			while (at >= 0)
			{
				c = charCodeArr[at];
				if (c < max)
				{
					c = c + 1;
					if ( c == 58 ) c = 97;
					charCodeArr[at] = c;
					if ( isRetChrArr )
					{
						return charCodeArr;
					}
					return String.fromCharCode.apply(null, charCodeArr);
				}
		
				charCodeArr[at] = minCharToUse;
				minCharToUse = min; //'a'; // next time..
				--at;
			}
			for ( var i = 0, len = charCodeArr.length ; i < len ; i++ )
			{
				charCodeArr[i] = max;
			}
			this._expand(charCodeArr, min);
			if ( isRetChrArr )
			{
				return charCodeArr;
			}
			return String.fromCharCode.apply(null, charCodeArr);
		},
		/**
		 * 주어진 aKey, bKey 사이의 순서에 해당하는 key 문자열을 반환한다.
		 * @param {string} aKey 시작 Key문자열
		 * @param {string} bKey 끝 Key문자열
		 * @return {string} 주어진 aKey, bKey 사이의 순서에 해당하는 key
		 * @memberOf Eco
		 */	
		getBetweenKey: function(aKey, bKey)
		{
			var aCharCodeArr = this._getCharCodeArr(aKey),
				bCharCodeArr;
			if ( !aCharCodeArr )
			{
				bCharCodeArr = this._getCharCodeArr(bKey);
				if ( !bCharCodeArr )
				{
					Eco.Logger.error("aKey, bKey 값이 invalid함!");
				}
				return this.getBeforeKey(bCharCodeArr);
			}
		
			bCharCodeArr = this._getCharCodeArr(bKey);
			if (!bCharCodeArr)
			{
				return this.getAfterKey(aCharCodeArr);
			}
		
			if ( aKey >= bKey )
			{
				Eco.Logger.error("aKey, bKey 값보다 크거나 같으면 구할 수 없다.");
			}

			var minLen = Math.min(aCharCodeArr.length, bCharCodeArr.length);

			var at = 0;
			while (at < minLen && aCharCodeArr[at] == bCharCodeArr[at] )
			{
				++at;
			}

			var newCharCodeArr, midVal,
				rangeCharIndex = this._rangeCharIndex;
			if (at < minLen && parseInt(bCharCodeArr[at] - aCharCodeArr[at]) >= 2)
			{
				newCharCodeArr = aCharCodeArr;
				midVal = parseInt((rangeCharIndex[aCharCodeArr[at]] + rangeCharIndex[bCharCodeArr[at]] + 1)/2);
				var avgCharCode = rangeCharIndex[midVal];
				newCharCodeArr[at] = avgCharCode;
				newCharCodeArr.length = at + 1;
				return String.fromCharCode.apply(null, newCharCodeArr);
			}
		
			if (aCharCodeArr.length > bCharCodeArr.length)
			{
				var newKey = this.getAfterKey(aCharCodeArr);
				if (newKey < bKey)
					return newKey;
			}
		
			if (bCharCodeArr.length > aCharCodeArr.length)
			{
				var newKey = this.getBeforeKey(bCharCodeArr);
				if (newKey > aKey)
					return newKey;
			}
		
			var min = 48, c;
			newCharCodeArr = aCharCodeArr.slice(0);
			while (newCharCodeArr.length < bCharCodeArr.length)
			{
				c = bCharCodeArr[newCharCodeArr.length];
				if (c > min+1)   // never taken?!
				{
					midVal = parseInt((rangeCharIndex[c] + 1)/2);
					c = rangeCharIndex[midVal];
					newCharCodeArr[newCharCodeArr.length] = c;
					return String.fromCharCode.apply(null, newCharCodeArr);
				}
				newCharCodeArr[newCharCodeArr.length] = min;
			}
			var max = 122;
			while (newCharCodeArr.length < aCharCodeArr.length)
			{
				c = aCharCodeArr[newCharCodeArr.length];
				if (c < max-1) // never taken?!
				{
					midVal = parseInt((35 + rangeCharIndex[c] + 1)/2);
					c = rangeCharIndex[midVal];
					newCharCodeArr[newCharCodeArr.length] = c;
					return String.fromCharCode.apply(null, newCharCodeArr);
				}
				newCharCodeArr[newCharCodeArr.length] = max;
			}
		
			this._expand(newCharCodeArr, 105);
			return String.fromCharCode.apply(null, newCharCodeArr);
		}
	};
	JsNamespace.addMethods(membernames, Eco, true, 
		function(name, fn) {
		this[name] = fn; //this는 Eco
		return name; //이 코드가 있어야 추가한 Method에 debug정보를 구성한다.
	});
	delete membernames;
}

if ( !JsNamespace.exist("Eco.HashMap") )
{
	JsNamespace.declareClass("Eco.HashMap", {
		/**
		 * HashMap 생성자(constructor)
		 * @class HashMap
		 * @classdesc key와 value 를 묶어서 하나의 entry로 저장한다.
		 * hasing을 사용하기 때문에 많은 양의 데이터를 검색하는데 뛰어난 성능을 보인다.<br>
		 * key값은 중복되지 않고 value값은 중복허용.<br>
		 * @constructor HashMap
		*/
		initialize: function()
		{
			this._size = 0;
			this._map = {};
		},
		statics: {
			_hashkeypool: {},
			_simpleToString: function()
			{
				return this._hashKey;
			},
			getHashKey: function(prefix, obj)
			{
				var key;
				if ( obj._hashKey == null )
				{
					var nextVal = this._hashkeypool[prefix];
					if ( nextVal == null )
					{
						nextVal = 0;
						this._hashkeypool[prefix] = nextVal;
					}
					else
					{
						nextVal++;
						this._hashkeypool[prefix] = nextVal;
					}
					key = prefix + nextVal;
					obj._hashKey = key;
				}
				else
				{
					key = obj._hashKey;
				}
				return key;
			},
			/**
			 * 객체를 hashMap의 key로 구성하고자 할 때, 해당 객체의 toString메소드가 유일한 key 값으로 반환하여야 하는데<br>
			 * 그렇지 않으면 toString 함수가 유일하게 반환 할 수 있도록 처리하여 주는 함수이다. 
			 * @param {object} obj 처리할 객체
			 * @param {number} toStringFn 주어지는 함수로 toString메소드 구성(this._hashKey를 이용하여 unique 값을 구성하면서 추가로 로직을 더한다. 만약 이 argument를 구성하지 않으면 return this._hashKey; toString이 구성된다.
			 * @static
			 * @memberOf Eco.HashMap
			*/
			makeHashKey: function(obj, toStringFn)
			{
				obj._hashKey = Eco.getUniqueId();
				obj.toString = toStringFn||this._simpleToString;
			},
			/**
			 * 주어진 arr에 존재하는 요소인 객체를 hashMap의 key로 구성하고자 할 때, 해당 객체의 toString메소드가 유일한 key 값으로 반환하여야 하는데<br>
			 * 그렇지 않으면 toString 함수가 유일하게 반환 할 수 있도록 처리하여 주는 함수이다. 
			 * @param {array} arr arr에 구성된 객체를 대상으로 처리한다.
			 * @param {number} toStringFn 주어지는 함수로 toString메소드 구성(this._hashKey를 이용하여 unique 값을 구성하면서 추가로 로직을 더한다. 만약 이 argument를 구성하지 않으면 return this._hashKey; toString이 구성된다.
			 * @static
			 * @memberOf Eco.HashMap
			*/
			makeHashKeyForArray: function(arr, toStringFn)
			{
				var getUniFn = Eco.getUniqueId;
				toStringFn = toStringFn||this._simpleToString;
				for ( var i = 0, len = arr.length ; i < len ; i++ )
				{
					arr[i]._hashKey = getUniFn();
					arr[i].toString = toStringFn;
				}
			}
		},
		/**
		 * 주어진 key에 value값을 저장한다.
		 * @param {string | object} key key
		 * @param {object} value value
		 * @return {*} 해당 key의 저장된 value값
		 * @memberOf Eco.HashMap
		*/
		put: function(key, value)
		{
			if ( this.containsKey(key) ) return false;
			var map = this._map;
			this._size++;
			return map[key] = value;
		},
		/**
		 * 키에 해당하는 value 반환.
		 * @param {string | object} key key
		 * @return {*} 키에 해당하는 value
		 * @memberOf Eco.HashMap
		*/
		"get": function(key)
		{
			return this._map[key];
		},
		/**
		 * 키에 해당하는 value 제거.
		 * @param {string | object} key key
		 * @return {boolean} 처리 결과
		 * @memberOf Eco.HashMap
		*/
		remove: function(key)
		{
			if ( !this.containsKey(key) ) return false;
			var map = this._map;
			this._size--;
			delete map[key];
			return true;
		},
		/**
		 * 주어진 key 값이 존재하는지 확인하는 함수
		 * @param {string} key key
		 * @return {boolean} 존재 여부
		 * @memberOf Eco.HashMap
		*/
		containsKey: function(key)
		{
			return key in this._map;
		},
		/**
		 * Eco.HashMap size 반환.
		 * @return {number} 저장된 size
		 * @memberOf Eco.HashMap
		*/
		getSize: function()
		{
			return this._size;
		},
		/**
		 * Eco.HashMap clear.
		 * @memberOf Eco.HashMap
		*/
		clear: function()
		{
			this._size = 0;
			this._map = {};
		},
		/**
		 * Dataset로 부터 key로 구성할 column명과 value로 구성할 column명을 가지고 hashMap 데이터를 구성한다.
		 * @param {Dataset} ds Dataset 객체
		 * @param {string} keyColumn key로 사용할 필드명
		 * @param {string} valueColumn value로 사용할 필드명
		 * @param {boolean} bClear 기존 데이터 clear여부 default true
		 * @memberOf Eco.HashMap
		*/
		fromDataset: function(ds, keyColumn, valueColumn, bClear)
		{
			if ( bClear !== false )
			{
				this.clear();
			}
			if ( valueColumn )
			{
				for ( var i = 0, len = ds.getRowCount() ; i < len ; i++ )
				{
					this.put(ds.getColumn(i, keyColumn), ds.getColumn(i, valueColumn));
				}
			}
			else
			{
				for ( var i = 0, len = ds.getRowCount() ; i < len ; i++ )
				{
					this.put(ds.getColumn(i, keyColumn), i);
				}
			}
		},
		/**
		 * hashMap에 저장된 값을 주어진 flag에 따라 array에 담아서 반환한다.<br>
		 * flag 값에 의해 데이터 구성 종류<br>
		 * 0 → value<br>
		 * 1 → key<br>
		 * 2-> {key: key, value: value}
		 * @param {number} flag 0 → only value, 1 → only key, 2-> {key: key, value: value}
		 * @return {*} 저장된 값을 주어진 flag에 따라 처리된 array
		 * @memberOf Eco.HashMap
		*/
		toArray: function(flag)
		{
			var arr = [];
			if ( flag == null ) flag = 0;
			if ( flag == 0 ) // getValues
			{
				this.forEach(function(key) { arr.push(key); });
			}
			else if ( flag == 1 ) // getKeys
			{
				this.forEach(function(key, value) { arr.push(value); });
			}
			else
			{
				this.forEach(function(key, value) { arr.push({key: key, value: value}); });
			}
			return arr;
		},
		/**
		 * 이곳에 저장된 데이터만큼 반복하여 주어진 f(function)을 호출하는 함수이다.
		 * @param {function} f 
		 * @memberOf Eco.HashMap
		*/
		forEach: function(f)
		{
			var map = this._map;
			for (var key in map)
			{
				f.call(this, key, map[key]);
			}
		},
		/**
		 * Eco.HashMap 저장된 값들을 trace로 확인한다.
		 * @private
		 * @memberOf Eco.HashMap
		*/
		_debug: function(bConsole)
		{
			if ( bConsole )
			{
				this.forEach(function(key, value) {
					console.log("key: ", key, "value: ", value);
				});
			}
			else
			{
				this.forEach(function(key, value) {
					trace(key + "--->" + value);
				});
			}
		}
	}); // end of 'JsNamespace.declare("Eco.HashMap",'
} // end of 'if ( !JsNamespace.exist("Eco.HashMap") )

if ( !JsNamespace.exist("Eco.BTree") )
{
	JsNamespace.declareClass("Eco.BTree", {
		/**
		 * Eco.BTree 생성자(constructor)
		 * @param {function=} compare sort하기 위한 compare함수
		 * @param {number=} capacity 저장하는 데이터가 내부적으로 조각난 array로 구성되는데, 이 조각나는 array 용량(default: 128)
		 * @class Eco.BTree
		 * @classdesc add시 입력되는 값들이 주어지는 compare 함수로 비교하여 sort된 상태로 메모리에 저장하는 객체<br>
		 * getIndex, remove, add, removeAt, getAt 등 메소드가 효과적인 성능을 내기 위해 저장되는 형태를 가지고 있다.<br>
		 * 참조: http://www.codeproject.com/Articles/274486/A-Better-Sorted-List-and-Dictionary
		 * Copyright 2011 Trent Tobler. All rights reserved.(일부 소스 변경)
		 * @constructor Eco.BTree
		*/
		initialize: function(compare, capacity)
		{
			if ( Eco.isFunction(compare) )
			{
				this.compare = compare;
			}
			else
			{
				
				if ( compare == "insertOrder" )
				{
					this._insertedKey = true;
					this.compare = this._defaultInsertOrderCompare;
				}
				else
				{
					this.compare = this._defaultCompare;
				}
			}
			this._capacity = capacity == null ? 128 : capacity;
			this.first = this._makeNode(true);
			if ( this._insertedKey ) this.last = this.first;
			this.root = this.first;
		},
		/**
		 * Eco.BTree compare함수가 "insertOrder" 값이면 입력되는 순서로 저장되므로 이를 위한 compare함수
		 * @private
		 * @memberOf Eco.BTree
		*/
		_defaultInsertOrderCompare: function(a, b)
		{
			if ( a.rowKey > b.rowKey ) return 1;
			if ( a.rowKey < b.rowKey ) return -1;
			return 0;
		},
		/**
		 * Eco.BTree compare함수를 별도로 지정하지 않으면 사용하는 compare함수
		 * @private
		 * @memberOf Eco.BTree
		*/
		_defaultCompare: function(a, b)
		{
			if (a == b) { return 0; }
			if ( a == null || a < b ) { return -1; }
  			if ( b == null || a > b ) { return 1; }			
		},
		/**
		 * 중복되는 값을 허용하는지 여부를 설정하는 함수
		 * @param {boolean} val true이면 중복허용
		 * @memberOf Eco.BTree
		*/
		setAllowDuplicates: function(val)
		{
			this.allowDuplicates = val;
		},
		/**
		 * 내부적으로 저장 구조에서 사용하는 node를 생성하는 함수
		 * @param {boolean} leaf leaf node 여부 true이면 leaf node임
		 * @return {object} node를 반환한다.
		 * @private
		 * @memberOf Eco.BTree
		*/
		_makeNode: function(leaf)
		{
			var node = {
				"keys": [],
				"nodes": null,
				"nodeCount":0,
				"totalCount":0,
				"parent": null,
				"next": null,
				"prev": null
			};
			if ( !leaf )
			{
				node.nodes = [];
			}
			return node;
		},
		/**
		 * 주어진 startIdx에서 len 만큼 저장된 데이타를 array로 반환한다.
		 * @param {number=} startIdx 시작 index (default: 0)
		 * @param {number=} len 데이타 개수 (default: 현재 저장된 데이타 개수)
		 * @return {array} array
		 * @memberOf Eco.BTree
		*/
		getValues: function(startIdx, len)
		{
			if ( startIdx == null ) startIdx = 0;
			if ( len == null ) len = this.getCount();
			len = startIdx + len;
			var res = [];
			var leaf = this.first, idx = 0, keys, resIdx = 0, rootIdx = 0;
			while(leaf)
			{
				if ( rootIdx + leaf.nodeCount < startIdx )
				{
					rootIdx += leaf.nodeCount - 1;
					continue;
				}
				else if ( rootIdx + leaf.nodeCount > len )
				{
					break;
				}
				else
				{
					keys = leaf.keys;
					for ( var i = 0, keysLen = keys.length ; i < keysLen ; i++ )
					{
						if ( startIdx <= rootIdx && rootIdx < len )
						{
							res[resIdx] = keys[i];
							resIdx++;
						}
						rootIdx++;
					}
				}
				leaf = leaf.next;
			}
			return res;
		},
		/**
		 * 이곳에 저장된 데이터만큼 반복하여 주어진 f(function)을 호출하는 함수이다.
		 * @param {function} f 
		 * @memberOf Eco.Btree
		*/
		forEach: function(f)
		{
			var node = this.first;
			for (; node ; node = node.next)
			{
				var keys = node.keys;
				for ( var i = 0, len = keys.length ; i < len ; i++ )
				{
					f.call(this, keys[i]);
				}
			}
		},
		/**
		 * 저장된 데이타 개수을 반환한다.
		 * @return {number} 저장된 데이타 개수
		 * @memberOf Eco.BTree
		*/
		getCount: function()
		{
			return this.root.totalCount;
		},
		/**
		 * 주어진 value의 저장된 index를 반환한다.
		 * @param {*} value 데이타 value
		 * @return {number} 주어진 value의 저장된 index
		 * @memberOf Eco.BTree
		*/
		getIndex: function(value)
		{
			var refVal = {"leaf": null, "pos": null};
			var found = this._nodeFind(this.root, value, this.compare, 0, refVal);
			if ( found )
			{
				var idx = this._getRootIndex(refVal.leaf, refVal.pos);
				return idx;
			}
			return -1;
		},
		/**
		 * 주어진 index에 저장된 value를 반환한다.
		 * @param {number} index 저장된 데이타 index
		 * @param {boolean=} isLeafInfo true이면 leaf와 leaf의 index값을 함께 array로 반환한다.(default: false)
		 * @return {*} 주어진 index에 저장된 value
		 * @memberOf Eco.BTree
		*/
		getAt: function(index, isLeafInfo)
		{
			if ( index < 0 || index >= this.getCount() )
			{
				Eco.Logger.info("Index out of range!!!");
				return;
			}
			var idx = {"index": index};
			var leaf = this._nodeLeafAt(this.root, idx);
			if ( isLeafInfo )
			{
				return [leaf.keys[idx.index], leaf, idx.index];
			}
			return leaf.keys[idx.index];
		},
		/**
		 * 주어진 index에 주어진 value값을 저장한다.<br>
		 * 사용하지 않은 함수이다.(차후에 의미을 부여할 예정임)
		 * @param {number} index 저장할 데이타의 index
		 * @param {*} value 저장할 데이타
		 * @memberOf Eco.BTree
		*/
		setAt: function(index, value)
		{
			if ( index < 0 || index >= this.getCount() )
			{
				Eco.Logger.error("Index out of range!!!");
			}
			var idx = {"index": index};
			var leaf = this._nodeLeafAt(this.root, idx);
			leaf.keys[idx.index] = value;
		},
		/**
		 * 주어진 value가 저장되었는지 여부를 반환한다.
		 * @param {*} value 저장된 데이타
		 * @return {boolean} 주어진 value가 저장되었는지 여부
		 * @memberOf Eco.BTree
		*/
		contain: function(value)
		{
			var refVal = {"leaf": null, "pos": null};
			return this._nodeFind(this.root, value, this.compare, 0, refVal);
		},
		/**
		 * 주어진 index의 앞에 value값을 저장한다.<br>
		 * insertedKey 값이 true일때만 처리되는 함수이다. 즉 입력되는 순서대로 sort할 때 처리되는 함수이다.<br>
		 * key별로 자동 정렬 처리가 되면 add시에 자동으로 정렬 위치에 저장되므로 이 함수은 의미가 없다. 
		 * @param {number} index 저장할 위치 index
		 * @param {*} value 저장할 데이타
		 * @return {boolean} 저장 처리 여부
		 * @memberOf Eco.BTree
		*/
		insertBefore: function(index, value)
		{
			if ( this._insertedKey )
			{
				var idx;
				if ( index < 0 || this.getCount() <= index )
				{
					return this.add(value);
				}
				else
				{
					var idx = {"index": index};
					var leaf = this._nodeLeafAt(this.root, idx);
					var refRoot = {root: this.root},
						pos = idx.index;
					if ( index == 0 )
					{
						value.rowKey = Eco.getBeforeKey(leaf.keys[pos].rowKey);
					}
					else
					{
						var prevValue;
						if ( pos == 0 )
						{
							var keys = leaf.prev.keys;
							prevValue = keys[keys.length - 1];
						}
						else
						{
							var keys = leaf.keys;
							prevValue = keys[pos - 1];
						}
						value.rowKey = Eco.getBetweenKey(prevValue.rowKey, leaf.keys[pos].rowKey);
					}
					this._nodeInsert( value, leaf, pos, refRoot );
					this.root = refRoot.root;
					return true;
				}
			}
			return false;
		},
		/**
		 * 주어진 value값을 정의된 정렬 위치에 저장 처리한다. <br>
		 * 만약 insertedKey 값이 true이면, 즉 입력되는 순서대로 저장되므로 마지막 순서에 저장된다.
		 * @param {*} value 저장할 데이타
		 * @return {boolean} 저장 처리 여부
		 * @memberOf Eco.BTree
		*/
		add: function(value)
		{
			if ( this._insertedKey )
			{
				var leaf = this.last,
					pos = leaf.keys.length;
				if ( this.getCount() == 0 )
				{
					value.rowKey = "1";
				}
				else
				{
					value.rowKey = Eco.getAfterKey(leaf.keys[pos - 1].rowKey);
				}
				var refRoot = {root: this.root};
				this._nodeInsert( value, leaf, pos, refRoot );
				this.root = refRoot.root;
			}
			else
			{
				var refVal = {"leaf": null, "pos": null};
				var found = this._nodeFind(this.root, value, this.compare, 0, refVal);
				if ( found && !this.allowDuplicates )
				{
					Eco.Logger.error("Duplicates are not allowed.");
				}
				var refRoot = {root: this.root};
				this._nodeInsert( value, refVal.leaf, refVal.pos, refRoot );
				this.root = refRoot.root;
			}
			return true;
		},
		/**
		 * 저장된 데이타를 모두 지운다.
		 * @memberOf Eco.BTree
		*/
		clear: function()
		{
			this._nodeClear(this.first);
			this.root = this.first;
			if ( this._insertedKey ) this.last = this.first;
		},
		/**
		 * 주어진 value값을 삭제한다.
		 * @param {*} value 저장할 데이타
		 * @return {boolean} 저장 처리 여부
		 * @memberOf Eco.BTree
		*/
		remove: function(value)
		{
			var refVal = {"leaf": null, "pos": null};
			if ( !this._nodeFind(this.root, value, this.compare, 0, refVal) )
			{
				return false;
			}
			var refRoot = {root: this.root};
			this._nodeRemove(refVal.leaf, refVal.pos, refRoot);
			this.root = refRoot.root;
			return true;
		},
		/**
		 * 주어진 index에 저장된 값을 삭제한다.
		 * @param {number} index 저장된 데이타 index
		 * @memberOf Eco.BTree
		*/
		removeAt: function(index)
		{
			if ( index < 0 || index >= this.getCount() )
			{
				Eco.Logger.error("Index out of range!!!");
			}
			var idx = {"index": index};
			var leaf = this._nodeLeafAt(this.root, idx);
			var refRoot = {root: this.root};
			this._nodeRemove(leaf, idx.index, refRoot);
			this.root = refRoot.root;
		},
		/**
		 * 주어진 r node 기준으로 tree node상에서 주어진 특정 위치(refpos.index)의<br>  
		 * leaf node와 leaf node의 위치(refpos.index)를 반환한다.
		 * @private
		 * @param {object} r 검색할 기준 node
		 * @param {object} refpos 속성으로 index을 가지고 이 값이 tree node상의 특정 위치 값 (반환할 때는 leaf node상에서 위치로 변경됨)
		 * @return {object} 주어진 위치에 해당하는 leaf node
		 * @memberOf Eco.BTree
		*/
		_nodeLeafAt: function(r, refpos)
		{
			var nodeidx = 0, node,
				pos = refpos.index;
			var dir = pos > r.totalCount/2 ? -1 : 1;
			if ( dir < 0 )
			{
				if ( r.nodes == null )
				{
					refpos.index = pos;
					return r;
				}
				nodeidx = r.nodes.length - 1;
				pos = r.totalCount - pos;
			}

			while(true)
			{
				if ( r.nodes == null )
				{
					refpos.index = pos;
					return r;
				}
				node = r.nodes[nodeidx];
				if ( dir > 0 )
				{
					if ( pos < node.totalCount )
					{
						r = node;
						if ( r.nodes == null )
						{
							refpos.index = pos;
							return r;
						}
						dir = pos > r.totalCount/2 ? -1 : 1;
						if ( dir < 0 )
						{
							nodeidx = r.nodes.length - 1;
							pos = r.totalCount - pos;
						}
						else
						{
							nodeidx = 0;
						}
					}
					else
					{
						pos -= node.totalCount;
						++nodeidx;
					}
				}
				else
				{
					if ( pos < node.totalCount )
					{
						pos = node.totalCount - pos;
						r = node;
						if ( r.nodes == null )
						{
							refpos.index = pos;
							return r;
						}
						dir = pos > r.totalCount/2 ? -1 : 1;
						if ( dir < 0 )
						{
							nodeidx = r.nodes.length - 1;
							pos = r.totalCount - pos;
						}
						else
						{
							nodeidx = 0;
						}
					}
					else
					{
						pos += node.totalCount;
						--nodeidx;
					}
				}
			}
		},
		/**
		 * 주어진 r node 기준으로 주어진 key값을 가지고 tree node상에서 찾아서 leaf node, leaf node상의 위치를 반환한다.  
		 * @private
		 * @param {object} r 검색할 기준 node
		 * @param {*} key 검색할 데이타 값
		 * @param {function} keycompare sort 기준이 되는 compare 함수
		 * @param {number} duplicatesBias 중복이 되면 어느쪽으로 방향 값(0 : 중복 아님)
		 * @param {object} refVal leaf 속성은 검색한 leaf node, pos 속성은 leaf node상의 위치
		 * @return {boolean} find 여부
		 * @memberOf Eco.BTree
		*/
		_nodeFind: function(r, key, keycompare, duplicatesBias, refVal)
		{
			var arrayUtil = Eco.array,
				tmpRefval = {},
				rowseq = 0;
			var pos = arrayUtil.binarySearch(r.keys, 0, r.nodeCount, key, keycompare), prevR = r, prevPos = pos;
			while ( r.nodes != null )
			{
				if( pos >= 0 )
				{
					if( duplicatesBias != 0 )
					{
						tmpRefval.node = r;
						tmpRefval.pos = pos;
						this._moveToDuplicatesBoundary( key, keycompare, duplicatesBias, tmpRefval );
						r = tmpRefval.node;
						pos = tmpRefval.pos;
					}
					r = r.nodes[pos];
				}
				else
				{
					pos = ~pos;
					if( pos > 0 )
					{
						--pos;
					}
					r = r.nodes[pos];
				}
				if ( r == null )
				{
					r = prevR;
					pos = prevPos;
					break;
				}
				prevR = r;
				prevPos = pos;
				pos = arrayUtil.binarySearch( r.keys, 0, r.nodeCount, key, keycompare );
			}
			leaf = r;
			refVal.leaf = r;
			if( pos < 0 )
			{
				pos = ~pos;
				refVal.pos = pos;
				return false;
			}

			refVal.pos = pos;
			if( duplicatesBias != 0 )
			{
				tmpRefval.node = leaf;
				tmpRefval.pos = pos;
				this._moveToDuplicatesBoundary(key, keycompare, duplicatesBias, tmpRefval );
				refVal.leaf = tmpRefval.node = tmpRefval.node;
				refVal.pos = tmpRefval.pos;
			}
			return true;
		},
		/**
		 * 주어진 leaf node의 주어진 pos 위치에 주어진 key값을 insert한다.  
		 * @private
		 * @param {*} key insert할 데이타 값
		 * @param {object} leaf leaf node
		 * @param {number} pos insert할 위치(leaf node상에)
		 * @param {object} refRoot root 속성으로 tree node상에 최상의 node이다.(insert후에 변경된 최상의 node가 설정된다.)
		 * @memberOf Eco.BTree
		*/
		_nodeInsert: function(key, leaf, pos, refRoot)
		{
			if ( this._ensureSpace(leaf, refRoot) && pos > leaf.nodeCount )
			{
				pos -= leaf.nodeCount;
				leaf = leaf.next;
			}
			// leaf node에 key값 insert 
			leaf.keys.splice(pos, 0, key);
			++leaf.nodeCount;

			// leaf node에서 parent node까지 key index를 갱신한다.
			this._ensureParentKey( leaf, pos );

			// totalCount 값을 갱신한다.
			for( var node = leaf; node != null; node = node.parent )
			{
				++node.totalCount;
			}
		},
		/**
		 * 주어진 leaf node의 주어진 pos 위치의 값을 remove한다.  
		 * @private
		 * @param {object} leaf leaf node
		 * @param {number} pos remove할 위치(leaf node상에)
		 * @param {object} refRoot root 속성으로 tree node상에 최상의 node이다.(remove후에 변경된 최상의 node가 설정된다.)
		 * @memberOf Eco.BTree
		*/
		_nodeRemove: function(leaf, pos, refRoot)
		{
			// totalCount 값을 갱신한다.
			for( var node = leaf; node != null; node = node.parent )
			{
				--node.totalCount;
			}
			// leaf node에 key값 remove 
			--leaf.nodeCount;
			leaf.keys.splice(pos, 1);


			// leaf node에서 parent node까지 key index를 갱신한다.
			if( leaf.nodeCount > 0 )
				this._ensureParentKey( leaf, pos );

			// leaf node 용량이 this.capacity 아래쪽이면 다른 쪽 node와 합친다.
			this._merge( leaf, refRoot);

			return true;
		},
		/**
		 * 주어진 leaf node 의 값을 모두 clear한다.  
		 * @private
		 * @param {object} leaf leaf node
		 * @memberOf Eco.BTree
		*/
		_nodeClear: function(firstNode)
		{
			firstNode.keys = [];
			firstNode.nodeCount = 0;
			firstNode.totalCount = 0;
			firstNode.parent = null;
			firstNode.next = null;
		},
		/**
		 * 주어진 arr를 가지고, 주어진 start 지점부터 len만큼 clear한다.  
		 * @private
		 * @param {array} arr array
		 * @param {number} start 시작 위치
		 * @param {number} len clear할 개수
		 * @memberOf Eco.BTree
		*/
		_arrayClear: function(arr, start, len)
		{
			var end = start + len,
				arrLen = arr.length,
				isLastClear = end == arrLen;
			for (var i = start; i < end ; i++ )
			{
				arr[i] = null;
			}
			if ( isLastClear )
			{
				arr.length = start;
			}
		},
		/**
		 * 주어진 arr를 가지고, 주어진 from 지점부터 len만큼 item의 index를 검색한다.  
		 * @private
		 * @param {array} arr array
		 * @param {*} item array에서 index를 검색할 요소
		 * @param {number} start 시작 위치
		 * @param {number} len clear할 개수
		 * @memberOf Eco.BTree
		*/
		_arrayIndexOf: function(arr, item, from, len)
		{
			for (; from < len; from++) 
			{
				if (arr[from] == item)
				{
					return from;
				}
			}
			return -1;
		},
		/**
		 * 주어진 leaf node와 leaf node상의 pos 값을 가지고 root node에서 시작되는 index를 반환한다.
		 * @private
		 * @param {object} leaf leaf node
		 * @param {number} pos leaf node상의 위치 
		 * @return {number} root node에서 시작되는 위치 값
		 * @memberOf Eco.BTree
		*/
		_getRootIndex: function(leaf, pos)
		{
			var node = leaf;
			var rootIndex = pos, nodePos;
			var p;
			while( p = node.parent )
			{
				nodePos = this._arrayIndexOf( p.nodes, node, 0, p.nodeCount );
				for( var i = 0; i < nodePos; ++i )
				{
					rootIndex += node.parent.nodes[i].totalCount;
				}
				node = node.parent;
			}
			return rootIndex;
		},
		/**
		 * 중복을 허용할 때 중복에 대한 key 값의 위치를 조정한다.
		 * @private
		 * @param {*} key key 값
		 * @param {function} keycompare sort 기준이 되는 compare 함수
		 * @param {number} duplicatesBias 중복이 되면 어느쪽으로 방향 값(0 : 중복 아님)
		 * @param {object} refVal 결과 처리된 node 와 위치(pos 값
		 * @memberOf Eco.BTree
		*/
		_moveToDuplicatesBoundary: function(key, keycompare, duplicatesBias, refVal )
		{
			var pos = refVal.pos,
				node = refVal.node;
			if( duplicatesBias < 0 )
			{
				// 중복에 대한 뒤 방향으로 move
				while( pos > 0 && 0 == keycompare( node.keys[pos - 1], key ) )
				{
					--pos;
				}

				// 중복이  parent key의 중심에 존재하면 prev node까지 뒤 방향으로 확장할 수 있다.
				if( pos == 0 && node.prev != null )
				{
					var prev = node.prev;
					var prevPos = prev.nodeCount;
					while( prevPos > 0 && 0 == keycompare( prev.keys[prevPos - 1], key ) )
					{
						--prevPos;
					}
					if( prevPos < prev.nodeCount )
					{
						node = prev;
						pos = prevPos;
					}
				}
			}
			else
			{
				// 중복에 대한 앞 방향으로 move
				while( pos < node.nodeCount - 1 && 0 == keycompare( node.keys[pos + 1], key ) )
				{
					++pos;
				}
			}
			refVal.pos = pos;
			refVal.node = node;
		},
		/**
		 *  주어진 node에 대하여 저장할 공간을 확보한다.
		 * @private
		 * @param {object} node node
		 * @param {object} refRoot root 속성으로 tree node상에 최상의 node이다.(변경된 최상의 node가 설정된다.)
		 * @memberOf Eco.BTree
		*/
		_ensureSpace: function(node, refRoot)
		{
			if ( node.nodeCount < this._capacity )
				return false;

			this._ensureParent( node, refRoot);
			this._ensureSpace( node.parent, refRoot);

			var sibling = this._makeNode( node.nodes == null );
			sibling.next = node.next;
			sibling.prev = node;
			sibling.parent = node.parent;

			if( node.next != null )
				node.next.prev = sibling;
			node.next = sibling;

			var pos = this._arrayIndexOf( node.parent.nodes, node, 0, node.parent.nodeCount );
			var siblingPos = pos + 1;

			node.parent.keys.splice(siblingPos, 0, node.parent.keys[siblingPos]);
			node.parent.nodes.splice(siblingPos, 0, null);

			++node.parent.nodeCount;
			node.parent.nodes[siblingPos] = sibling;

			var half = node.nodeCount / 2;
			var halfCount = node.nodeCount - half;
			this._move( node, half, sibling, 0, halfCount );
			return true;
		},
		/**
		 *  source array 의 sourceIndex 부터 count만큼 요소들을 target array 의 targetIndex에 복사한 후<br>
		 * source array에서 target array로 복사된 요소들을 제거한다. 즉 source array 요소들을 target array로 move한다.
		 * @private
		 * @param {array} source
		 * @param {number} sourceIndex 시작 위치
		 * @param {number} sourceTotal source array length
		 * @param {array} target
		 * @param {number} targetIndex 시작 위치
		 * @param {number} targetTotal target array length
		 * @param {number} count move할 요소 개수
		 * @memberOf Eco.BTree
		*/
		_movecopy: function(source, sourceIndex, sourceTotal, target, targetIndex, targetTotal, count)
		{
			var arrayUtil = Eco.array;
			// target array에 targetindex 부터 count만큼 빈자리 확보한다.
			arrayUtil.arrayCopy( target, targetIndex, target, targetIndex + count, targetTotal - targetIndex );
			// source array에 sourceIndex 부터 count만큼 요소들을 target array의 targetindex 부터 복사한다.
			arrayUtil.arrayCopy( source, sourceIndex, target, targetIndex, count );
			// source array에 sourceIndex 부터 count만큼 요소들을 제거한다.
			arrayUtil.arrayCopy( source, sourceIndex + count, source, sourceIndex, sourceTotal - sourceIndex - count );
			this._arrayClear( source, sourceTotal - count, count );
		},
		/**
		 *  주어진 source node의 sourceIndex 부터 moveCount만큼 target node의 targetIndex에 데이타 값을 move한다.
		 * @private
		 * @param {object} source source enode
		 * @param {number} sourceIndex source 시작 위치
		 * @param {object} target target node
		 * @param {number} targetIndex target 시작 위치
		 * @param {number} moveCount move할 데이타 개수
		 * @memberOf Eco.BTree
		*/
		_move: function(source, sourceIndex, target, targetIndex, moveCount )
		{
			this._movecopy( source.keys, sourceIndex, source.nodeCount, target.keys, targetIndex, target.nodeCount, moveCount );

			var totalMoveCount;
			if( source.nodes == null )
			{
				totalMoveCount = moveCount;
				if ( this._insertedKey ) 
				{
					if ( target.nodes == null && target.next == null )
					{
						this.last = target;
					}
				}
			}
			else
			{
				this._movecopy( source.nodes, sourceIndex, source.nodeCount, target.nodes, targetIndex, target.nodeCount, moveCount );
				totalMoveCount = 0;
				for( var i = 0; i < moveCount; ++i )
				{
					var child = target.nodes[targetIndex + i];
					child.parent = target;
					totalMoveCount += child.totalCount;
				}
			}
			source.nodeCount -= moveCount;
			target.nodeCount += moveCount;

			var sn = source;
			var tn = target;
			while( sn != null && sn != tn )
			{
				sn.totalCount -= totalMoveCount;
				tn.totalCount += totalMoveCount;
				sn = sn.parent;
				tn = tn.parent;
			}
			this._ensureParentKey( source, sourceIndex );
			this._ensureParentKey( target, targetIndex );
		},
		/**
		 *  주어진 node의 parent를 설정한다. 만약 parent가 존재하면 별다른 처리 루틴 없이 skip한다.
		 * @private
		 * @param {object} node node
		 * @param {object} refRoot root 속성으로 신규로 처리된 parent을 설정한다. 
		 * @memberOf Eco.BTree
		*/
		_ensureParent: function(node, refRoot)
		{
			if( node.parent != null )
				return;

			var parent = this._makeNode( false );
			parent.totalCount = node.totalCount;
			parent.nodeCount = 1;
			parent.keys[0] = node.keys[0];
			parent.nodes[0] = node;

			node.parent = parent;
			refRoot.root = parent;
		},
		/**
		 *  주어진 node의 첫번째 key값과 parent에 설정된 key값을 일치 시킨다.
		 * @private
		 * @param {object} node node
		 * @param {number} pos
		 * @memberOf Eco.BTree
		*/
		_ensureParentKey: function(node, pos)
		{
			while( pos == 0 && node.parent != null )
			{
				pos = this._arrayIndexOf( node.parent.nodes, node, 0, node.parent.nodeCount );
				node.parent.keys[pos] = node.keys[0];
				node = node.parent;
			}
		},
		/**
		 *  주어진 node에 대하여 저장된 데이터 개수가 없으면 해당 node를 없애고 tree 및 link node 정보를 갱신한다.
		 * @private
		 * @param {object} node node
		 * @param {object} refRoot root 속성으로 tree node상에 최상의 node이다.(변경된 최상의 node가 설정된다.)
		 * @memberOf Eco.BTree
		*/
		_merge: function(node, refRoot)
		{
			if( node.nodeCount == 0 )
			{
				// empty node에 관련 처리
				if( node.parent == null )
				{
					if ( this._insertedKey ) this.last = this.first;
					return;
				}

				// parent nodes로 부터 node를 제거한다.
				var pos = this._arrayIndexOf( node.parent.nodes, node, 0, node.parent.nodeCount );
				--node.parent.nodeCount;
				var arrayUtil = Eco.array;
				arrayUtil.arrayCopy( node.parent.keys, pos + 1, node.parent.keys, pos, node.parent.nodeCount - pos );
				arrayUtil.arrayCopy( node.parent.nodes, pos + 1, node.parent.nodes, pos, node.parent.nodeCount - pos );
				node.parent.keys.length = node.parent.nodeCount;
				node.parent.nodes.length = node.parent.nodeCount;

				// parent node key값을 아래로 연결시킨다.
				if( node.parent.nodeCount > 0 )
					this._ensureParentKey( node.parent, pos );

				// node에 연결된 next/prev 값을 제거한다.
				node.prev.next = node.next;
				if( node.next != null )
				{
					node.next.prev = node.prev;
				}
				// parent node를 merge처리한다.
				this._merge( node.parent, refRoot);
				return;
			}

			if( node.next == null )
			{
				if( node.parent == null && node.nodeCount == 1 && node.nodes != null )
				{
					refRoot.root = node.nodes[0];
					refRoot.root.parent = null;
				}
				if ( this._insertedKey && node.nodes == null )
				{
					this.last = node;
				}
				return;
			}

			if( node.nodeCount >= this._capacity/2 )
			{
				return;
			}

			var count = node.next.nodeCount;
			if ( (node.nodeCount + count) > this._capacity )
			{
				count = count - parseInt(( node.nodeCount + count ) / 2);
			}
			this._move( node.next, 0, node, node.nodeCount, count );
			this._merge( node.next, refRoot);
		}
	});
}

if ( !JsNamespace.exist("Eco.LinkedHashMap") )
{
	JsNamespace.declareClass("Eco.LinkedHashMap", {
		/**
		 * Eco.LinkedHashMap 생성자(constructor)
		 * @class Eco.LinkedHashMap
		 * @classdesc HashMap 기능에 더하여 insert 순서대로 정렬하여 저장한다. 
		 * @constructor Eco.LinkedHashMap
		 * @extends Eco.LinkedHashMap
		*/
		initialize: function()
		{
			this.callParent(arguments);
			this._btree = new Eco.BTree("insertOrder");
		},
		"extends": 'Eco.HashMap', //inherited HashMap.
		/**
		 * 주어진 key, value값을 마지막 순서에 저장한다.
		 * @param {string | object} key key
		 * @param {object} value value
		 * @return {*} 해당 key의 저장되었던 value값
		 * @memberOf Eco.LinkedHashMap
		*/
		put: function(key, value)
		{
			if ( this.containsKey(key) ) return false;
			var newEntry = {key:key, value:value};
			this._btree.add(newEntry);
			this._map[key] = newEntry;
			return value;
		},
		/**
		 * 키에 해당하는 value 반환.
		 * @param {string | object} key key
		 * @return {*} 키에 해당하는 value
		 * @memberOf Eco.LinkedHashMap
		*/
		"get": function(key)
		{
			var entry = this._map[key];
			if ( entry )
			{
				return entry.value;
			}
			return null;
		},
		/**
		 * 주어진 키의 다음 위치 value 반환한다.
		 * @param {string | object} key key
		 * @return {*} 주어진 키의 다음 위치 value
		 * @memberOf Eco.LinkedHashMap
		*/
		"getNext" : function(key)
		{
			var entry = this._map[key];
			if ( entry )
			{
				var idx = this._btree.getIndex(entry);
				if ( idx > -1 ) //key가 존재함
				{
					return this.getAt(++idx);
				}
			}
			return null;
		},
		/**
		 * 주어진 키의 이전 위치 value 반환한다.
		 * @param {string | object} key key
		 * @return {*} 주어진 키의 이전 위치 value
		 * @memberOf Eco.LinkedHashMap
		*/
		"getPrev" : function(key)
		{
			var entry = this._map[key];
			if ( entry )
			{
				var idx = this._btree.getIndex(entry);
				if ( idx > -1 ) //key가 존재함
				{
					return this.getAt(--idx);
				}
			}
			return null;
		},
		/**
		 * 주어진 index의 value 반환한다.
		 * @param {number} index 저정된 index
		 * @return {*} 주어진 index의 value
		 * @memberOf Eco.LinkedHashMap
		*/
		"getAt": function(index)
		{
			if ( index < 0 || index >= this._btree.getCount() )
			{
				return null;
			}
			var entry = this._btree.getAt(index);
			if ( entry )
			{
				return entry.value;
			}
			return null;
		},
		/**
		 * 주어진 key에 해당하는 index 반환한다.
		 * @param {string | object} key key
		 * @return {number} 주어진 key에 해당하는 index
		 * @memberOf Eco.LinkedHashMap
		*/
		"getIndex": function(key)
		{
			var entry = this._map[key];
			if ( entry )
			{
				return this._btree.getIndex(entry);
			}
			return -1;
		},
		/**
		 * 주어진 existKeyOrPos에 해당하는 위치을 기준으로  주어진 key, value을 insert한다.
		 * @param {string | object} key key
		 * @param {object} value value
		 * @param {string | object | number} existKeyOrPos insert할 위치 key 또는 insert할 위치 index
		 * @param {boolean} bExistIndex existKeyOrPos argument가 index 값이면 true, key값이면 false로 구성해야 한다. default값은 false이다.
		 * @memberOf Eco.LinkedHashMap
		*/
		insertBefore: function(key, value, existKeyOrPos, bExistIndex)
		{
			if ( this.containsKey(key) ) return false;
			var map = this._map,
				btree = this._btree,
				newEntry;
			if ( bExistIndex )
			{
				if ( existKeyOrPos < 0 || existKeyOrPos >= btree.getCount() )
				{
					return this.put(key, value);
				}
				newEntry = {key:key, value:value};
				btree.insertBefore(existKeyOrPos, newEntry);
			}
			else
			{
				var existEntry = map[existKeyOrPos];
				if ( !existEntry )
				{
					return this.put(key, value);
				}
				var inspos = btree.getIndex(existEntry);
				if ( inspos < 0 )
				{
					return this.put(key, value);
				}
				newEntry = {key:key, value:value};
				btree.insertBefore(inspos, newEntry);
			}
			map[key] = newEntry;
			return value;
		},
		/**
		 * 주어진 index부터 주어진 len만큼 저장된 정보를 제거한다.
		 * @param {number} index 시작할 index
		 * @param {number} len index 부터 처리할 크기
		 * @memberOf Eco.LinkedHashMap
		*/
		removeRange: function(index, len)
		{
			var map = this._map,
				btree = this._btree,
				start = index,
				end = Math.min(index + len, btree.getCount());
			
			if ( start < 0 || start >= btree.getCount() )
			{
				Eco.Logger.error("index out of range!");
			}
			var entry, refRoot;
			for ( ; start < end ; start++ )
			{
				entry = btree.getAt(start, true);
				refRoot.root = btree.root;
				btree._nodeRemove(entry[1], entry[2], refRoot);
				btree.root = refRoot.root;
				delete map[entry[0].key];
			}
		},
		/**
		 * 키에 해당하는 value 제거.
		 * @param {string | object} key key
		 * @return {boolean} 처리 여부
		 * @memberOf Eco.LinkedHashMap
		*/
		remove: function(key)
		{
			if ( !this.containsKey(key) ) return false;
			var btree = this._btree,
				map = this._map,
				entry = map[key];

			if ( entry )
			{
				btree.remove(entry);
				delete map[key];
				return true;
			}
		},
		/**
		 * 키에 해당하는 value 제거.
		 * @param {string | object} key key
		 * @return {string | object} remove된 value 값
		 * @memberOf Eco.LinkedHashMap
		*/
		removeAt: function(index)
		{
			var btree = this._btree,
				map = this._map;
			var entry = btree.getAt(index, true);
			if ( entry )
			{
				var refRoot = {root: btree.root};
				btree._nodeRemove(entry[1], entry[2], refRoot);
				btree.root = refRoot.root;
				delete map[entry[0].key];
				return true;
			}
			return false;
		},
		/**
		 * Eco.LinkedHashMap clear.
		 * @memberOf Eco.LinkedHashMap
		*/
		clear: function()
		{
			this._map = {};
			this._btree.clear();
		},
		/**
		 * 이곳에 저장된 데이터만큼 반복하여 주어진 f(function)을 호출하는 함수이다.
		 * @param {function} f 
		 * @memberOf Eco.LinkedHashMap
		*/
		forEach: function(f)
		{
			var _self = this;
			this._btree.forEach(function(val)
			{
				f.call(_self, val.key, val.value);
			});
		},
		/**
		 * Eco.LinkedHashMap size 반환.
		 * @return {number} 저장된 size
		 * @memberOf Eco.LinkedHashMap
		*/
		getSize: function()
		{
			return this._btree.getCount();
		},
		/**
		 * Eco.LinkedHashMap에 저장된 값들을 trace로 확인한다.
		 * @private
		 * @memberOf Eco.LinkedHashMap
		*/
		_debug: function(bConsole)
		{
			var seq = 0;
			if ( bConsole )
			{
				this.forEach(function(key, value) {
					console.log("seq: ", seq,  "key: ", key, "value: ", value);
					seq++;
				});
			}
			else
			{
				this.forEach(function(key, value) {
					trace(seq + ": " + key + "--->" + value);
					seq++;
				});
			}
		}
	}); // end of 'JsNamespace.declare("Eco.LinkedHashMap",'
} // end of 'if ( !JsNamespace.exist("Eco.LinkedHashMap") )

if ( !JsNamespace.exist("Eco.KeySortedHashMap") )
{
	JsNamespace.declareClass("Eco.KeySortedHashMap", {
		/**
		 * Eco.KeySortedHashMap 생성자(constructor)
		 * @class Eco.KeySortedHashMap
		 * @classdesc HashMap 기능에 더하여 key 정렬로 데이터를 저장한다. 
		 * @constructor Eco.KeySortedHashMap
		 * @extends Eco.KeySortedHashMap
		*/
		initialize: function(compareFn)
		{
			this.callParent(arguments);
			if ( Eco.isFunction(compareFn) )
			{
				this._btree = new Eco.BTree(compareFn);
			}
			else
			{
				this._btree = new Eco.BTree(this._defaultCompare);
			}
		},
		_defaultCompare: function(a, b)
		{
			if ( a.key > b.key ) return 1;
			if ( a.key < b.key ) return -1;
			return 0;
		},
		/**
		 * 주어진 sortFn로 저장된 데이터를 정렬한다. 
		 * @param {function} sortFn 정렬 방식을 지정하는 함수.
		 * @memberOf Eco.KeySortedHashMap
		*/
		sort: function(compareFn)
		{
			var btree = this._btree,
				map = this._map;
			btree.clear();
			if ( Eco.isFunction(compareFn) )
			{
				btree.compare = compareFn;
			}
			else
			{
				btree.compare = this._defaultCompare;
			}
			for ( var key in map )
			{
				btree.add(map[key]);
			}
		},
		"extends": 'Eco.HashMap', //inherited HashMap.
		/**
		 * 주어진 key에 value값을 저장한다.
		 * @param {string | object} key key
		 * @param {object} value value
		 * @return {*} 해당 key의 저장되었던 value값
		 * @memberOf Eco.KeySortedHashMap
		*/
		put: function(key, value)
		{
			if ( this.containsKey(key) ) return false;
			var newEntry = {key:key, value:value};
			this._btree.add(newEntry);
			this._map[key] = newEntry;
			return value;
		},
		/**
		 * 키에 해당하는 value 반환.
		 * @param {string | object} key key
		 * @return {*} 키에 해당하는 value
		 * @memberOf Eco.KeySortedHashMap
		*/
		"get": function(key)
		{
			var entry = this._map[key];
			if ( entry )
			{
				return entry.value;
			}
			return null;
		},
		/**
		 * 주어진 키의 다음 위치 value 반환한다.
		 * @param {string | object} key key
		 * @return {*} 주어진 키의 다음 위치 value
		 * @memberOf Eco.KeySortedHashMap
		*/
		"getNext" : function(key)
		{
			var entry = this._map[key];
			if ( entry )
			{
				var idx = this._btree.getIndex(entry);
				if ( idx > -1 ) //key가 존재함
				{
					return this.getAt(++idx);
				}
			}
			return null;
		},
		/**
		 * 주어진 키의 이전 위치 value 반환한다.
		 * @param {string | object} key key
		 * @return {*} 주어진 키의 이전 위치 value
		 * @memberOf Eco.KeySortedHashMap
		*/
		"getPrev" : function(key)
		{
			var entry = this._map[key];
			if ( entry )
			{
				var idx = this._btree.getIndex(entry);
				if ( idx > -1 ) //key가 존재함
				{
					return this.getAt(--idx);
				}
			}
			return null;
		},
		/**
		 * 주어진 index의 value 반환한다.
		 * @param {number} index 저정된 index
		 * @return {*} 주어진 index의 value
		 * @memberOf Eco.KeySortedHashMap
		*/
		"getAt": function(index)
		{
			if ( index < 0 || index >= this._btree.getCount() )
			{
				return null;
			}
			var entry = this._btree.getAt(index);
			if ( entry )
			{
				return entry.value;
			}
			return null;
		},
		/**
		 * 주어진 key에 해당하는 index 반환한다.
		 * @param {string | object} key key
		 * @return {number} 주어진 key에 해당하는 index
		 * @memberOf Eco.KeySortedHashMap
		*/
		"getIndex": function(key)
		{
			var entry = this._map[key];
			if ( entry )
			{
				return this._btree.getIndex(entry);
			}
			return -1;
		},
		/**
		 * 주어진 index부터 주어진 len만큼 저장된 정보를 제거한다.
		 * @param {number} index 시작할 index
		 * @param {number} len index 부터 처리할 크기
		 * @memberOf Eco.KeySortedHashMap
		*/
		removeRange: function(index, len)
		{
			var btree = this._btree;
			var start = index,
				end = Math.min(index + len, btree.getCount());
			
			if ( start < 0 || start >= btree.getCount() )
			{
				Eco.Logger.error("index out of range!");
			}
			var entry, refRoot;
			for ( ; start < end ; start++ )
			{
				entry = btree.getAt(start, true);
				refRoot.root = btree.root;
				btree._nodeRemove(entry[1], entry[2], refRoot);
				btree.root = refRoot.root;
				delete map[entry[0].key];
			}
		},
		/**
		 * 키에 해당하는 value 제거.
		 * @param {string | object} key key
		 * @return {boolean} 처리 여부
		 * @memberOf Eco.KeySortedHashMap
		*/
		remove: function(key)
		{
			if ( !this.containsKey(key) ) return false;
			var btree = this._btree,
				map = this._map,
				entry = map[key];

			if ( entry )
			{
				btree.remove(entry);
				delete map[key];
				return true;
			}
		},
		/**
		 * 키에 해당하는 value 제거.
		 * @param {string | object} key key
		 * @return {string | object} remove된 value 값
		 * @memberOf Eco.KeySortedHashMap
		*/
		removeAt: function(index)
		{
			var btree = this._btree,
				map = this._map;
			var entry = btree.getAt(index, true);
			if ( entry )
			{
				var refRoot = {root: btree.root};
				btree._nodeRemove(entry[1], entry[2], refRoot);
				btree.root = refRoot.root;
				delete map[entry[0].key];
				return true;
			}
			return false;
		},
		/**
		 * Eco.LinkedHashMap clear.
		 * @memberOf Eco.KeySortedHashMap
		*/
		clear: function()
		{
			this._map = {};
			this._btree.clear();
		},
		/**
		 * 이곳에 저장된 데이터만큼 반복하여 주어진 f(function)을 호출하는 함수이다.
		 * @param {function} f 
		 * @memberOf Eco.KeySortedHashMap
		*/
		forEach: function(f)
		{
			var _self = this;
			this._btree.forEach(function(val)
			{
				f.call(_self, val.key, val.value);
			});
		},
		/**
		 * Eco.KeySortedHashMap size 반환.
		 * @return {number} 저장된 size
		 * @memberOf Eco.KeySortedHashMap
		*/
		getSize: function()
		{
			return this._btree.getCount();
		},
		/**
		 * 주어진 key 값으로 저장되는 위치 반환.<br/>
		 * 주로 key 값으로 저장된 데이터가 없다 할 지라도, key에 해당하는 데이터 위치를 얻을 수 있다. 
		 * @param {*} key key 값
		 * @return {number} 주어진 key값의 위치
		 * @memberOf Eco.KeySortedHashMap
		*/
		findPos: function(key)
		{
			var dummyEntry = {key:key, value: null};
			var refVal = {"leaf": null, "pos": null},
				btree = this._btree;
			btree._nodeFind(btree.root, dummyEntry, btree.compare, 0, refVal);
			return refVal.pos;
		},
		/**
		 * Eco.KeySortedHashMap 저장된 값들을 trace로 확인한다.
		 * @private
		 * @memberOf Eco.KeySortedHashMap
		*/
		_debug: function(bConsole)
		{
			var seq = 0;
			if ( bConsole )
			{
				this.forEach(function(key, value) {
					console.log("seq: ", seq,  "key: ", key, "value: ", value);
					seq++;
				});
			}
			else
			{
				this.forEach(function(key, value) {
					trace(seq + ": " + key + "--->" + value);
					seq++;
				});
			}
		}
	}); // end of 'JsNamespace.declare("Eco.KeySortedHashMap",'
} // end of 'if ( !JsNamespace.exist("Eco.KeySortedHashMap") )

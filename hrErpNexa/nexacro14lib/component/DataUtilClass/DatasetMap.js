/**
 * @fileoverview
 * Eco.DatasetMap Class 정의 
 */

if ( !JsNamespace.exist("Eco.DatasetMap") )
{
	JsNamespace.declareClass("Eco.DatasetMap", {
		/**
		 * Eco.DatasetMap 생성자(constructor)
		 * @param {boolean} allowDuplicates key 값이 중복허용할지 여부(default: false)
		 * @class Eco.DatasetMap
		 * @classdesc Dataset에서 행(row)별로 데이터를 unique한 key column으로 map 정보를 구성하는 객체<br>
		 * key 항목으로 검색 처리가 for loop으로 하지 않고 object key collection 검색하여 처리 속도가 데이터의 크기와 상관없다.<br>
		 * 또한 Dataset의 행(row)별로 객체 값으로 데이터를 구성하여 담을 수 있는 메모리 구조이다.
		 * @constructor Eco.DatasetMap
		*/
		initialize: function(allowDuplicates)
		{
			this._allowDuplicates = allowDuplicates;
			this.clear();
		},
		/**
		 * 데이터를 모두 지운다.
		 * @memberOf Eco.DatasetMap
		*/
		clear: function()
		{
			this.keyMap = {};
			if ( this._btree )
			{
				this._btree.clear();
			}
			else
			{
				this._btree = new Eco.BTree("insertOrder");
			}
		},
		/**
		 * 이곳에 저장된 데이터만큼 반복하여 주어진 f(function)을 호출하는 함수이다.
		 * @param {function} f 
		 * @memberOf Eco.DatasetMap
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
		 * 주어진 start 시점부터 len만큼 저정된 data를 array 복사하여 반환한다.
		 * @param {number} start copy할 data 시작 index(default: 0)
		 * @param {number} len copy할 시작 시점부터 size(default: 저장된 size)
		 * @return {array} copy한 array
		 * @memberOf Eco.DatasetMap
		*/
		toArray: function(start, len)
		{
			return this._btree.getValues(start, len);
		},
		/**
		 * 주어진 key 값이 존재하는지 확인하는 함수
		 * @param {string} key key 값
		 * @return {boolean} 존재 여부
		 * @memberOf Eco.DatasetMap
		*/
		containsKey: function(key)
		{
			return key in this.keyMap;
		},
		/**
		 * 주어진 key 값이 가지는 row를 얻는다.
		 * @param {string} key key 값
		 * @return {number} key값에 해당하는 row
		 * @memberOf Eco.DatasetMap
		*/
		findRowByKey: function(key)
		{
			var data = this.keyMap[key];
			if ( data )
			{
				if ( this._allowDuplicates )
				{
					if ( Eco.isArray(data) && data._dataArray === true )
					{
						data = data[0];
					}
				}
				return this._btree.getIndex(data);
			}
			return -1;
		},
		/**
		 * 주어진 row에 주어진 key, data을 insert한다.
		 * @param {number} row index of row 
		 * @param {string} key key 값
		 * @param {object} data row별로 저장하는 객체 값
		 * @memberOf Eco.DatasetMap
		*/
		insert: function(row, key, data)
		{
			if ( !this._allowDuplicates && this.containsKey(key) ) return false;
			var btree = this._btree;
			if ( row < 0 || row >= btree.getCount() )
			{
				return this.add(key, data);
			}
			data.key = key;
			btree.insertBefore(row, data);
			var map = this.keyMap;
			if ( this._allowDuplicates && this.containsKey(key) )
			{
				var dataArr = map[key];
				if ( Eco.isArray(dataArr) && dataArr._dataArray === true )
				{
					dataArr.push(data);
				}
				else
				{
					dataArr = [dataArr, data];
					dataArr._dataArray = true;
					map[key] = dataArr;
				}
			}
			else
			{
				map[key] = data;
			}
			return true;
		},
		/**
		 * 주어진 key, data을 add한다.
		 * @param {string} key key 값
		 * @param {*} data row별로 저장하는 객체 값
		 * @memberOf Eco.DatasetMap
		*/
		add: function(key, data)
		{
			if ( !this._allowDuplicates && this.containsKey(key) ) return false;
			data.key = key;
			this._btree.add(data);
			var map = this.keyMap;
			if ( this._allowDuplicates && this.containsKey(key) )
			{
				var dataArr = map[key];
				if ( Eco.isArray(dataArr) && dataArr._dataArray === true )
				{
					dataArr.push(data);
				}
				else
				{
					dataArr = [dataArr, data];
					dataArr._dataArray = true;
					map[key] = dataArr;
				}
			}
			else
			{
				map[key] = data;
			}
			return true;
		},
		/**
		 * 주어진 row의 data를 삭제한다.
		 * @param {number} row index of row 
		 * @memberOf Eco.DatasetMap
		*/
		removeAt: function(row)
		{
			var btree = this._btree,
				map = this.keyMap;
			var data = btree.getAt(row, true);
			if ( data )
			{
				var refRoot = {root: btree.root};
				btree._nodeRemove(data[1], data[2], refRoot);
				btree.root = refRoot.root;
				var key = data[0].key;
				if ( this._allowDuplicates && this.containsKey(key) )
				{
					var dataArr = map[key];
					if ( Eco.isArray(dataArr) && dataArr._dataArray === true )
					{
						var idx = Eco.array.indexOf(dataArr, data, 0, true);
						if ( idx > -1 )
						{
							dataArr.splice(idx, 1);
							if ( !dataArr.length )
							{
								delete map[key];
							}
						}
					}
					else
					{
						delete map[key];
					}
				}
				else
				{
					delete map[key];
				}
				return true;
			}
			return false;
		},
		/**
		 * 주어진 key의 data를 삭제한다.
		 * @param {string} key 값
		 * @memberOf Eco.DatasetMap
		*/
		removeAtKey: function(key)
		{
			if ( !this._allowDuplicates && !this.containsKey(key) ) return false;
			var btree = this._btree,
				map = this.keyMap,
				data = map[key];

			if ( data )
			{
				if ( this._allowDuplicates && this.containsKey(key) )
				{
					var dataArr = map[key];
					if ( Eco.isArray(dataArr) && dataArr._dataArray === true )
					{
						for ( var i = 0, len = dataArr.length ; i < len ; i++ )
						{
							btree.remove(dataArr[i]);
						}
						delete map[key];
					}
					else
					{
						btree.remove(data);
						delete map[key];
					}
				}
				else
				{
					btree.remove(data);
					delete map[key];
				}
				return true;
			}
		},
		/**
		 * 주어진 dataset, object create하는 함수를 가지고 dataset의 row 매치되는  데이터를 구성한다.<br>
		 * 두번째 주어지는 keyColumnId 이 dataset에 구성되는 column명이고 이 column에 존재하는 데이터가 key 값이 된다.<br>
		 * 세번쨰 인자로 주어지는 createDataFunc는 data 객체를 구성하기 호출하는 함수이다.<br>
		 * 이 함수는 정의시에 return 값으로 객체가 되어야 한다.<br>
		 * createDataFunc의 arguments ( dataset, row, key ) 로 넘겨준다.
		 * @example
		 * //taskItem 객체 생성하는 함수
		 * function createTaskItem(ds, row, key)
		 * {
		 *    var sdt = ds.getColumn(row, "Start");
		 *    var edt = ds.getColumn(row, "Finish");
		 *    var taskName = ds.getColumn(row, "TaskName");
		 *    var data = {
		 *      taskname: taskName,
		 *      startdate: sdt,
		 *      finishdate: edt
		 *    };
		 *    return data;
		 * }
		 *
		 * var dsMap = new Eco.DatasetMap();
		 * dsMap.buildDataWithDataset(Dataset00, "cd", createTaskItem, this);
		 *
		 * @param {Dataset} ds dataset
		 * @param {string} keyColumnId key 값을 얻는 dataset column 명
		 * @param {function} createDataFunc data 객체를 생성하는 처리함수
		 * @param {*} scope createDataFunc 함수 내부에 사용되는 this
		 * @memberOf Eco.DatasetMap
		*/
		buildDataWithDataset: function(ds, keyColumnId, createDataFunc, scope)
		{
			this.clear();
			var key, data,
				btree = this._btree,
				keyvals = this.keyMap;
			for ( var i = 0, len = ds.rowcount ; i < len ; i++ )
			{
				key = ds.getColumn(i, keyColumnId) + "";
				data = createDataFunc.call(scope, ds, i, key);
				data.key = key;
				keyvals[key] = data;
				btree.add(data);
			}
		},
		/**
		 * 저장된 data의 key값을 변경하는 처리 함수이다.
		 * @param {*} data 이곳에 저장된 data 값
		 * @param {*} key 변경하려는 data값
		 * @memberOf Eco.DatasetMap
		*/
		changeKey: function(data, key)
		{
			var oldKey = data.key,
				map = this.keyMap;
			if ( this._allowDuplicates && this.containsKey(oldKey) )
			{
				var dataArr = map[oldKey];
				if ( Eco.isArray(dataArr) && dataArr._dataArray === true )
				{
					var idx = Eco.array.indexOf(dataArr, data, 0, true);
					if ( idx > -1 )
					{
						dataArr.splice(idx, 1);
						if ( !dataArr.length )
						{
							delete map[oldKey];
						}
					}
				}
				else
				{
					delete map[oldKey];
				}
			}
			else
			{
				delete map[oldKey];
			}
			data.key = key;
			if ( this._allowDuplicates && this.containsKey(key) )
			{
				var dataArr = map[key];
				if ( Eco.isArray(dataArr) && dataArr._dataArray === true )
				{
					dataArr.push(data);
				}
				else
				{
					dataArr = [dataArr, data];
					dataArr._dataArray = true;
					map[key] = dataArr;
				}
			}
			else
			{
				map[key] = data;
			}
		},
		/**
		 * 주어진 행(row)의 data 객체를 구하는 메소드입니다.
		 * @param {number} row index of row
		 * @return {*} 주어진 row의 data 객체
		 * @memberOf Eco.DatasetMap
		*/
		getAt: function(row)
		{
			if ( row < 0 || row >= this._btree.getCount() )
			{
				return null;
			}
			return this._btree.getAt(row);
		},
		/**
		 * 주어진 key의 data 객체를 구하는 메소드입니다.
		 * @param {string} key key 값
		 * @return {*} 주어진 key의 data 객체
		 * @memberOf Eco.DatasetMap
		*/
		getByKey: function(key)
		{
			var data = this.keyMap[key];
			if ( data )
			{
				if ( this._allowDuplicates )
				{
						if ( Eco.isArray(data) && data._dataArray === true )
						{
							data = data[0];
						}
				}
			}
			return data;
		},
		/**
		 * 지정된 두 row 위치를 서로 바꾸는 메소드입니다
		 * @param {number} row1 data 저장 위치
		 * @param {number} row2 data 저장 위치
		 * @memberOf Eco.DatasetMap
		*/
		exchangeRow: function(row1, row2)
		{
			var btree = this._btree;
			if ( row1 < 0 || row1 >= btree.getCount() )
			{
				return false;
			}
			if ( row2 < 0 || row2 >= btree.getCount() )
			{
				return false;
			}

			var dataAtRow1 = btree.getAt(row1, true);
			var dataAtRow2 = btree.getAt(row2, true);

			var rowKey1 = dataAtRow1[0].rowKey;
			var rowKey2 = dataAtRow2[0].rowKey;

			dataAtRow1[0].rowKey = rowKey2;
			dataAtRow2[0].rowKey = rowKey1;
			dataAtRow1[1].keys[dataAtRow1[2]] = dataAtRow2[0];
			dataAtRow2[1].keys[dataAtRow2[2]] = dataAtRow1[0];
			btree._ensureParentKey( dataAtRow1[1], dataAtRow1[2] );
			btree._ensureParentKey( dataAtRow2[1], dataAtRow2[2] );
			return true;
		},
		/**
		 * 주어진 oldRow의 data 객체를 주어진 newRow로 이동하는 처리이다.
		 * @param {number} oldRow 이동 하려는 row
		 * @param {number} newRow 이동을 원하는 row
		 * @memberOf Eco.DatasetMap
		*/
		moveRow: function(oldRow, newRow)
		{
			var btree = this._btree;
			if ( oldRow < 0 || oldRow >= btree.getCount() )
			{
				return false;
			}

			var oldDataAtRow = btree.getAt(oldRow, true);
			if ( oldDataAtRow )
			{
				var refRoot = {root: btree.root};
				btree._nodeRemove(oldDataAtRow[1], oldDataAtRow[2], refRoot);
				btree.root = refRoot.root;
				var map = this.keyMap;
				var key = oldDataAtRow[0].key;
				if ( this._allowDuplicates && this.containsKey(key) )
				{
					var dataArr = map[key];
					if ( Eco.isArray(dataArr) && dataArr._dataArray === true )
					{
						var idx = Eco.array.indexOf(dataArr, data, 0, true);
						if ( idx > -1 )
						{
							dataArr.splice(idx, 1);
							if ( !dataArr.length )
							{
								delete map[key];
							}
						}
					}
					else
					{
						delete map[key];
					}
				}
				else
				{
					delete map[key];
				}
				return this.insert(newRow, oldDataAtRow[0].key, oldDataAtRow[0]);
			}
			return false;
		}
	}); // end of 'JsNamespace.declare("DatasetMap",'
} // end of 'if ( !JsNamespace.exist("DatasetMap") )'



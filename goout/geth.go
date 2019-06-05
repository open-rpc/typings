type StringKf9OiYth string
type StringZ5YLbwqQ string
type NullRQUGiJgL interface{}
type StringPOvQTIDR string
type StringUqJ74Jlu string
type StringLgnYdKZN string
type StringAtRpOtwN string
type StringQvf80GFh string
type StringTDEWBIKS string
type StringBDHG5W7T string
type StringHWopfk7J string
type StringKOjdCjxA string
type StringJBhyG8GQ string
type StringKPs0GysM string
type StringL9Q7FxNL string
type ObjectUAh7GW7V struct {
	BlockHash        *string `json:"blockHash"`
	BlockNumber      *string `json:"blockNumber"`
	From             *string `json:"from"`
	Gas              string  `json:"gas"`
	GasPrice         string  `json:"gasPrice"`
	Hash             *string `json:"hash"`
	Input            *string `json:"input"`
	Nonce            string  `json:"nonce"`
	R                *string `json:"r"`
	S                *string `json:"s"`
	To               *string `json:"to"`
	TransactionIndex *string `json:"transactionIndex"`
	V                *string `json:"v"`
	Value            *string `json:"value"`
}
type StringB5DfMjke string
// The optional block height description
type StringYrxVoV1I string
const (
	Earliest StringYrxVoV1I = "earliest"
	Latest StringYrxVoV1I = "latest"
	Pending StringYrxVoV1I = "pending"
)
type OneOfXlkl3BTC string
type StringFHi5MA5J string
type StringJTIltKLs string
type BooleanQg3XFxa5 bool
type StringZf1H2D3V string
type StringFBQcPpNI string
type StringMFgeDDAI string
type StringHMV18VPt string
type ArrayI3ORtMCD []string
type OneOf0Ft0MMBJ struct {
	String      *string
	StringArray []string
}
type StringUJ54NQoI string
type ArrayVpBPNUJk []string
// A filter used to monitor the blockchain for log/events
type ObjectUss01Ezs struct {
	Address   *OneOf0Ft0MMBJ `json:"address"`
	FromBlock *string        `json:"fromBlock"`
	ToBlock   *string        `json:"toBlock"`
	Topics    []string       `json:"topics"`
}
type StringJQn9E2ZF string
type StringB9UyW0N9 string
// The storage keys of all the storage slots being requested
type UnknownH93ZKRe9 struct {
	AnythingMap map[string]interface{}
	Bool        *bool
	Double      *float64
	Integer     *int64
	String      *string
	StringArray []string
}
type StringOKCKxjwk string
type StringKD30QJWE string
type StringOFI4GkPy string
type StringP06TvJ9O string
type StringRdbz2VG7 string
type StringWxzVcTo3 string
type StringFfbG50Gm string
type StringChS0EFmE string
type StringLjsNIMQg string
type StringJWtuARu5 string
type StringEGYqBq3N string
type String1GrQoMVK string
type StringG3JeWUu5 string
type StringRXfGEw2K string
type StringR3RoDYzq string
type StringL7XUIUsm string
type StringIeOMLFn2 string
type StringFKios7Md string
type StringTyjyuYpP string
type StringFzRCJdAJ string
type StringNzAf0JkB string
type StringQvRWxtpW string
type StringJGTq233G string
type OneOfHrzWCZTc struct {
	ObjectUAh7GW7V *ObjectUAh7GW7V
	String         *string
}
type ArrayIXWcgnqj []OneOfHrzWCZTc
type StringYAaJTsj8 string
type ArrayTgJ90RKB []string
type ObjectW9HVODO0 struct {
	Difficulty       *string         `json:"difficulty"`
	ExtraData        *string         `json:"extraData"`
	GasLimit         *string         `json:"gasLimit"`
	GasUsed          *string         `json:"gasUsed"`
	Hash             *string         `json:"hash"`
	LogsBloom        *string         `json:"logsBloom"`
	Miner            *string         `json:"miner"`
	Nonce            *string         `json:"nonce"`
	Number           *string         `json:"number"`
	ParentHash       *string         `json:"parentHash"`
	ReceiptsRoot     *string         `json:"receiptsRoot"`
	Sha3Uncles       *string         `json:"sha3Uncles"`
	Size             *string         `json:"size"`
	StateRoot        *string         `json:"stateRoot"`
	Timestamp        *string         `json:"timestamp"`
	TotalDifficulty  *string         `json:"totalDifficulty"`
	Transactions     []OneOfHrzWCZTc `json:"transactions"`
	TransactionsRoot *string         `json:"transactionsRoot"`
	Uncles           []string        `json:"uncles"`
}
type StringJAFPzKMM string
type StringDPOMSq5S string
type StringGoAynn1J string
type StringCApN5ELp string
type StringLROhfqnN string
type UnknownLCfbop5R interface{}
type UnknownZrmfDRJu interface{}
type ArrayFtTzilpO []interface{}
type StringPqZ7XWYZ string
type StringNgYUDgoJ string
// An indexed event generated during a transaction
type ObjectEEEStwYd struct {
	Address          *string       `json:"address"`
	BlockHash        *string       `json:"blockHash"`
	BlockNumber      *string       `json:"blockNumber"`
	Data             *string       `json:"data"`
	LogIndex         *string       `json:"logIndex"`
	Removed          interface{}   `json:"removed"`
	Topics           []interface{} `json:"topics"`
	TransactionHash  *string       `json:"transactionHash"`
	TransactionIndex *string       `json:"transactionIndex"`
}
type ArrayZQ4JTMa6 []ObjectEEEStwYd
// An indexed event generated during a transaction
type StringZsHdgqq2 string
type StringCUmmptWM string
type StringDqZ4Z73L string
type StringMzt8Q9H6 string
type Array2HzjZ4Pf []ObjectEEEStwYd
// An array of all the logs triggered during the transaction
//
// An indexed event generated during a transaction
type StringQkKj8Rbd string
type StringZxGYJr9R string
type StringOXM12YXK string
type StringKk7LjvGs string
type StringGHwma2SQ string
type BooleanKQSJd0Qn bool
// The receipt of a transaction
type ObjectInnf1Jcf struct {
	BlockHash            string           `json:"blockHash"`
	BlockNumber          string           `json:"blockNumber"`
	ContractAddress      string           `json:"contractAddress"`
	CumulativeGasUsed    string           `json:"cumulativeGasUsed"`
	From                 string           `json:"from"`
	GasUsed              string           `json:"gasUsed"`
	Logs                 []ObjectEEEStwYd `json:"logs"`
	LogsBloom            string           `json:"logsBloom"`
	PostTransactionState *string          `json:"postTransactionState"`
	Status               *bool            `json:"status"`
	To                   string           `json:"to"`
	TransactionHash      string           `json:"transactionHash"`
	TransactionIndex     string           `json:"transactionIndex"`
}
type ObjectYofLXCXZ struct {
	Difficulty       *string  `json:"difficulty"`
	ExtraData        *string  `json:"extraData"`
	GasLimit         *string  `json:"gasLimit"`
	GasUsed          *string  `json:"gasUsed"`
	Hash             *string  `json:"hash"`
	LogsBloom        *string  `json:"logsBloom"`
	Miner            *string  `json:"miner"`
	Nonce            *string  `json:"nonce"`
	Number           *string  `json:"number"`
	ParentHash       *string  `json:"parentHash"`
	ReceiptsRoot     *string  `json:"receiptsRoot"`
	Sha3Uncles       *string  `json:"sha3Uncles"`
	Size             *string  `json:"size"`
	StateRoot        *string  `json:"stateRoot"`
	Timestamp        *string  `json:"timestamp"`
	TotalDifficulty  *string  `json:"totalDifficulty"`
	TransactionsRoot *string  `json:"transactionsRoot"`
	Uncles           []string `json:"uncles"`
}
type StringCNTx2FTe string
type StringKy3QABSD string
type StringSc17ZL56 string
type ArrayM4X6XUV6 []string
type StringG4Py23Zl string
type StringTQdJfDLF string
type StringMoKoJRCN string
type StringTsbnTPJA string
type StringJ56YicLB string
type StringZXg6RlHu string
// Object proving a relationship of a storage value to an account's storageHash.
type ObjectODyRnQvw struct {
	Key   *string  `json:"key"`
	Proof []string `json:"proof"`
	Value *string  `json:"value"`
}
type ArrayZdpyteuQ []ObjectODyRnQvw
// Current block header PoW hash.
//
// Object proving a relationship of a storage value to an account's storageHash.
type ObjectF9IZWyXd struct {
	AccountProof []string         `json:"accountProof"`
	Address      *string          `json:"address"`
	Balance      *string          `json:"balance"`
	CodeHash     *string          `json:"codeHash"`
	Nonce        *string          `json:"nonce"`
	StorageHash  *string          `json:"storageHash"`
	StorageProof []ObjectODyRnQvw `json:"storageProof"`
}
type StringSxHUt3ZF string
type StringYxHIMGPV string
type ArrayVaatsyBE []string
type StringILNESJ4R string
type BooleanMuwLrrnv bool
type StringOSYzUyOT string
type StringXcC8Tb9B string
type StringRoAZYaWB string
type BooleanOYZPITjK bool
type BooleanNXTptD5M bool
type StringG24E9Duk string
type StringMS1ABXa4 string
type StringJvNx1Dv3 string
type StringZzQ1Tl78 string
type StringRAFCj4Tq string
// An object with sync status data
type ObjectQN4RqE6Z struct {
	CurrentBlock  *string `json:"currentBlock"`
	HighestBlock  *string `json:"highestBlock"`
	KnownStates   *string `json:"knownStates"`
	PulledStates  *string `json:"pulledStates"`
	StartingBlock *string `json:"startingBlock"`
}
type BooleanCJTSZKW4 bool
// An object with sync status data
type OneOf5ZIsDKft struct {
	Bool           *bool
	ObjectQN4RqE6Z *ObjectQN4RqE6Z
}
type BooleanEbyLbglB bool
type EthereumJSONRPC interface {
	Web3ClientVersion() (error, StringWxzVcTo3)
	Web3Sha3(data StringKf9OiYth) (error, StringZ5YLbwqQ)
	NetListening() (error, BooleanQg3XFxa5)
	NetPeerCount() (error, StringFfbG50Gm)
	NetVersion() (error, StringWxzVcTo3)
	EthBlockNumber() (error, OneOfXlkl3BTC)
	EthCall(transaction ObjectUAh7GW7V, blockNumber OneOfXlkl3BTC) (error, StringChS0EFmE)
	EthChainId() (error, StringKf9OiYth)
	EthCoinbase() (error, StringLjsNiMQg)
	EthEstimateGas(transaction ObjectUAh7GW7V) (error, StringJWtuARu5)
	EthGasPrice() (error, StringEGYqBq3N)
	EthGetBalance(address StringFHi5MA5J, blockNumber StringB5DfMjke) (error, OneOfITHE4QuJ)
	EthGetBlockByHash(blockHash StringJTIltKLs, includeTransactions BooleanQg3XFxa5) (error, OneOfCLgxZQzB)
	EthGetBlockByNumber(blockNumber OneOfXlkl3BTC, includeTransactions BooleanQg3XFxa5) (error, OneOfCLgxZQzB)
	EthGetBlockTransactionCountByHash(blockHash StringJTIltKLs) (error, OneOfITHE4QuJ)
	EthGetBlockTransactionCountByNumber(blockNumber OneOfXlkl3BTC) (error, OneOfITHE4QuJ)
	EthGetCode(address StringFHi5MA5J, blockNumber StringB5DfMjke) (error, StringOKCKxjwk)
	EthGetFilterChanges(filterId StringZf1H2D3V) (error, ArrayZQ4JTMa6)
	EthGetFilterLogs(filterId StringZf1H2D3V) (error, ArrayZQ4JTMa6)
	EthGetRawTransactionByHash(transactionHash StringQvf80GFh) (error, StringOKCKxjwk)
	EthGetRawTransactionByBlockHashAndIndex(blockHash StringJTIltKLs, index StringPOvQTIDR) (error, StringOKCKxjwk)
	EthGetRawTransactionByBlockNumberAndIndex(blockNumber OneOfXlkl3BTC, index StringPOvQTIDR) (error, StringOKCKxjwk)
	EthGetLogs(filter ObjectUss01Ezs) (error, ArrayZQ4JTMa6)
	EthGetStorageAt(address StringFHi5MA5J, key StringJQn9E2ZF, blockNumber OneOfXlkl3BTC) (error, StringKD30QJWE)
	EthGetTransactionByBlockHashAndIndex(blockHash StringJTIltKLs, index StringPOvQTIDR) (error, OneOf08Ts8ZCB)
	EthGetTransactionByBlockNumberAndIndex(blockNumber OneOfXlkl3BTC, index StringPOvQTIDR) (error, OneOf08Ts8ZCB)
	EthGetTransactionByHash(transactionHash StringQvf80GFh) (error, OneOf08Ts8ZCB)
	EthGetTransactionCount(address StringFHi5MA5J, blockNumber OneOfXlkl3BTC) (error, OneOfIjERop3I)
	EthGetTransactionReceipt(transactionHash StringQvf80GFh) (error, OneOfDqw9YbmS)
	EthGetUncleByBlockHashAndIndex(blockHash StringJTIltKLs, index StringPOvQTIDR) (error, OneOfGWikAFJA)
	EthGetUncleByBlockNumberAndIndex(uncleBlockNumber StringB5DfMjke, index StringPOvQTIDR) (error, OneOfGWikAFJA)
	EthGetUncleCountByBlockHash(blockHash StringJTIltKLs) (error, OneOfITHE4QuJ)
	EthGetUncleCountByBlockNumber(blockNumber OneOfXlkl3BTC) (error, OneOfM5IH7RF1)
	EthGetProof(address StringFHi5MA5J, storageKeys UnknownH93ZKRe9, blockNumber OneOfXlkl3BTC) (error, OneOfVQkjFyh6)
	EthGetWork() (error, ArrayVaatsyBE)
	EthHashrate() (error, StringIlNESJ4R)
	EthMining() (error, BooleanMuwLrrnv)
	EthNewBlockFilter() (error, StringOsYzUyOT)
	EthNewFilter(filter ObjectUss01Ezs) (error, StringOsYzUyOT)
	EthNewPendingTransactionFilter() (error, StringOsYzUyOT)
	EthProtocolVersion() (error, StringXcC8Tb9B)
	EthSendRawTransaction(signedTransactionData StringOKCKxjwk) (error, StringRoAZYaWB)
	EthSubmitHashrate(hashRate StringKD30QJWE, id StringKD30QJWE) (error, BooleanOYZPITjK)
	EthSubmitWork(nonce StringOFI4GkPy, powHash StringP06TvJ9O, mixHash StringRdbz2VG7) (error, BooleanNXTptD5M)
	EthSyncing() (error, OneOf5ZIsDKft)
	EthUninstallFilter(filterId StringZf1H2D3V) (error, BooleanEbyLbglB)
}
import debounce from "lodash.debounce";

class ThresholdObserver
{
	constructor(threshold, _default=0, offset=0)
	{
		this.prev = _default;
		this.threshold = threshold;
		this.offset = offset;
	}
	checkEach(current, threshold)
	{
		if( (this.prev >= threshold - this.offset) && (current < threshold + this.offset ) ) return -1; //below
		if( (this.prev <= threshold - this.offset) && (current > threshold + this.offset ) ) return 1; //over
		return 0;
	}
	update(current, callback)
	{
		const debouncedCallback = debounce(callback, 200);

		if(typeof this.threshold === "number")
		{
			const res=this.checkEach(current, this.threshold);
			if(res === 1) debouncedCallback(1);
			else if(res === -1) debouncedCallback(0);
		}
		if(Array.isArray(this.threshold))
		{
			for(let i=0; i<this.threshold.length; i++)
			{
				const res=this.checkEach(current, this.threshold[i]);
				if(res === 1) debouncedCallback( (i<<1) + 1 );
				else if(res === -1) debouncedCallback( (i<<1) + 0 );
			}
		}
		this.prev = current;
	}
}

export {ThresholdObserver};
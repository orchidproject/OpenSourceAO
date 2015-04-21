require 'json'
class Replay
	def initialize(options,ioSocket) 
		@options = options
		@log=File.read("logs/"+options[:layer_id]).split("\n")
		@ioSocket= ioSocket

		@prefix="{\"channel\":\"" +@options[:layer_id]+ "\", \"data\":"
		@suffix="}"
		@index = 0 

		@play=false
		
		#@logs = []
		#log.each_with_index do |item,index|
		#	@logs[index] = item.to_json
		#end
	end 

	def start
		#actual play thread
		puts "will start play"
		if(!@play)
			puts "start play"
			th=Thread.new do 
				puts "start play actually"
				
				previous_time=nil
				@log.each do |data|
					json_data=JSON.parse(data)
					if(previous_time) 
						puts Float(json_data[:time_stamp]-previous_time)/(1000.0*speed)
						sleep  Float(json_data[:time_stamp]-previous_time)/(1000.0*speed)
					end
					previous_time=json_data[:time_stamp]
					
					@ioSocket.broadcast(@prefix+data+@suffix)
					
				end
			end
			
			@play=true
		end
	end

	def pause
		@play=false
	end

	def stop
		@play_index=0;
	end
	
	#for  test
	def list 
	     @log[0].gsub("\"","\'")
	end 

	#accessors, some used to fake a Game "interface"
	def latitude
		@options[:latitude]
	end

	def longitude
		@options[:longitude]
	end

	def radius 
		@options[:radius]
	end

	def name
		:replay
	end

	def is_active
		1
	end
	
	#imitation of a game class
	def layer_id
		@options[:layer_id]
	end 

end

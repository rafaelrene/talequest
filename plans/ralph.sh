MAX_ITERATION=200

current_iteration=0

PLANS_PATH="./plans/2026-02-21-talequest-foundation"
STATUS_FILE_PATH="$PLANS_PATH/STATUS.md"
PROMPT_FILE_PATH="$PLANS_PATH/PROMPT.md"
MODEL_NAME="openai/gpt-5.3-codex"

echo "Starting Ralph..."

while true; do
	iteration=$((current_iteration++))

	if [ $iteration -gt $MAX_ITERATION ]; then
		echo "Ralph has reached the maximum iteration limit of $MAX_ITERATION."
		break
	fi

	# Check status.md for the current status and stop condition
	STATUS=$(grep -o 'Status: [a-zA-Z]*' $STATUS_FILE_PATH | cut -d' ' -f2)

	if [ "$STATUS" == "done" ] || [ "$STATUS" = "blocked" ]; then
		echo "Ralph has reached the stop condition: ${STATUS}."
		cat $STATUS_FILE_PATH
		break
	fi

	echo ""
	echo "=== Running Ralph Iteration $iteration / $MAX_ITERATION at $(date) ==="
	echo "=== Current Status: ${STATUS} ==="
	echo ""

	# Run opencode with prompt file
	prompt=$(cat $PROMPT_FILE_PATH)
	opencode run "$prompt" --model=$MODEL_NAME --variant=max

	# Sleep for a little bit to avoid overloading the APIs
	sleep 2
done

echo ""
echo "Ralph has completed its iterations."

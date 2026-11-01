import React, { useState, useEffect } from 'react'
import { 
  Box, Text, Checkbox, Stack, 
  RangeSlider, RangeSliderTrack, RangeSliderFilledTrack, RangeSliderThumb,
  Accordion, AccordionItem, AccordionButton, AccordionPanel, AccordionIcon,
  HStack, Input, InputGroup, InputRightElement
} from '@chakra-ui/react'

const clamp = (v, lo, hi) => Math.min(Math.max(v, lo), hi)

function FilterSidebar({ categorySlug, filters, setFilters, minMaxPrice, options }) {

  const [minBound, maxBound] = minMaxPrice

  // Локальний стан ціни (щоб повзунок і поля рухались разом)
  const [range, setRange] = useState(filters.priceRange || [minBound, maxBound])
  const [minText, setMinText] = useState(String((filters.priceRange || minMaxPrice)[0]))
  const [maxText, setMaxText] = useState(String((filters.priceRange || minMaxPrice)[1]))

  // Синхронізація при зміні фільтрів або категорії
  useEffect(() => {
    const r = filters.priceRange || [minBound, maxBound]
    setRange(r)
    setMinText(String(r[0]))
    setMaxText(String(r[1]))
  }, [filters.priceRange, minBound, maxBound])

  const handleFilterChange = (key, value) => {
    setFilters(prev => {
      const currentValues = prev[key] || []
      if (currentValues.includes(value)) {
        return { ...prev, [key]: currentValues.filter(v => v !== value) }
      } else {
        return { ...prev, [key]: [...currentValues, value] }
      }
    })
  }

  const handlePriceChange = (val) => {
    setFilters(prev => ({ ...prev, priceRange: val }))
  }

  // Повзунок: під час руху оновлюємо поля, по відпусканню — фільтри
  const handleSliderChange = (val) => {
    setRange(val)
    setMinText(String(val[0]))
    setMaxText(String(val[1]))
  }

  // Ручне введення МІН
  const commitMin = () => {
    let v = parseInt(minText, 10)
    if (isNaN(v)) v = minBound
    v = clamp(v, minBound, range[1])
    const next = [v, range[1]]
    setRange(next)
    setMinText(String(v))
    handlePriceChange(next)
  }

  // Ручне введення МАКС
  const commitMax = () => {
    let v = parseInt(maxText, 10)
    if (isNaN(v)) v = maxBound
    v = clamp(v, range[0], maxBound)
    const next = [range[0], v]
    setRange(next)
    setMaxText(String(v))
    handlePriceChange(next)
  }

  const handleEnter = (commit) => (e) => {
    if (e.key === 'Enter') {
      commit()
      e.target.blur()
    }
  }

  const handleSaleChange = (e) => {
    setFilters(prev => ({ ...prev, onlySale: e.target.checked }))
  }

  const priceInputProps = {
    type: "number",
    inputMode: "numeric",
    size: "sm",
    bg: "white",
    border: "2px solid black",
    borderRadius: "8px",
    fontWeight: "bold",
    textAlign: "center",
    pr: 6,
    _hover: { borderColor: "black" },
    _focus: { borderColor: "#FF0080", boxShadow: "0 0 0 1px #FF0080" },
    sx: {
      '&::-webkit-outer-spin-button, &::-webkit-inner-spin-button': { WebkitAppearance: 'none', margin: 0 },
      MozAppearance: 'textfield',
    },
  }

  const renderCheckboxGroup = (title, key, optionsList) => {
    if (!optionsList || optionsList.length === 0) return null
    return (
      <AccordionItem border="none" mb={4}>
        <h2>
          <AccordionButton px={0} _hover={{ bg: 'transparent' }}>
            <Box flex='1' textAlign='left' fontWeight="bold" textTransform="uppercase" fontSize="sm">
              {title}
            </Box>
            <AccordionIcon />
          </AccordionButton>
        </h2>
        <AccordionPanel pb={4} px={0}>
          <Stack spacing={2} maxH={key === 'flavor' ? "200px" : "auto"} overflowY={key === 'flavor' ? "auto" : "visible"}>
            {optionsList.map(opt => (
              <Checkbox 
                key={opt} 
                colorScheme="blackAlpha" 
                iconColor="white"
                borderColor="black"
                isChecked={filters[key]?.includes(opt)}
                onChange={() => handleFilterChange(key, opt)}
              >
                <Text fontSize="sm">{opt}</Text>
              </Checkbox>
            ))}
          </Stack>
        </AccordionPanel>
      </AccordionItem>
    )
  }

  return (
    <Box w={{ base: "100%", md: "250px" }} pr={{ md: 6 }} borderRight={{ md: "1px solid black" }}>
      
      <Accordion allowMultiple defaultIndex={[0, 1, 2, 3]}>
        
        {/* ЦІНА */}
        <AccordionItem border="none" mb={6}>
          <Text fontWeight="bold" mb={4} textTransform="uppercase" fontSize="sm">Ціна</Text>
          <Box px={2}>
            <RangeSlider 
              aria-label={['min', 'max']} 
              min={minBound} max={maxBound} 
              value={range}
              onChange={handleSliderChange}
              onChangeEnd={handlePriceChange}
              colorScheme="pink"
            >
              <RangeSliderTrack bg='gray.200'>
                <RangeSliderFilledTrack bg='black' />
              </RangeSliderTrack>
              <RangeSliderThumb index={0} border="2px solid black" boxSize={4} />
              <RangeSliderThumb index={1} border="2px solid black" boxSize={4} />
            </RangeSlider>
          </Box>

          {/* 👇 Ручне введення мін / макс */}
          <HStack mt={4} spacing={2}>
            <InputGroup size="sm">
              <Input
                {...priceInputProps}
                aria-label="Мінімальна ціна"
                value={minText}
                onChange={(e) => setMinText(e.target.value)}
                onBlur={commitMin}
                onKeyDown={handleEnter(commitMin)}
              />
              <InputRightElement pointerEvents="none" fontSize="xs" fontWeight="bold" color="gray.500">₴</InputRightElement>
            </InputGroup>
            <Text fontWeight="bold">–</Text>
            <InputGroup size="sm">
              <Input
                {...priceInputProps}
                aria-label="Максимальна ціна"
                value={maxText}
                onChange={(e) => setMaxText(e.target.value)}
                onBlur={commitMax}
                onKeyDown={handleEnter(commitMax)}
              />
              <InputRightElement pointerEvents="none" fontSize="xs" fontWeight="bold" color="gray.500">₴</InputRightElement>
            </InputGroup>
          </HStack>
        </AccordionItem>

        {/* АКЦІЇ */}
        <Box mb={6}>
          <Checkbox 
            colorScheme="blackAlpha" 
            borderColor="black"
            isChecked={filters.onlySale} 
            onChange={handleSaleChange} 
            fontWeight="bold"
          >
            Тільки зі знижкою %
          </Checkbox>
        </Box>

        {/* БРЕНД */}
        {renderCheckboxGroup("Бренд", "brand", options.brands)}

        {/* === РІДИНИ === */}
        {categorySlug === 'liquids' && (
          <>
            {renderCheckboxGroup("Об'єм (мл)", "volume", options.volumes)}
            {renderCheckboxGroup("Група смаків", "tasteGroup", options.tasteGroups)}
            {renderCheckboxGroup("Конкретний смак", "flavor", options.flavors)}
            {renderCheckboxGroup("Країна", "country", options.countries)}
          </>
        )}

        {/* === POD СИСТЕМИ === */}
        {categorySlug === 'pods' && (
          <>
            {renderCheckboxGroup("Дисплей", "display", options.displays)}
            {renderCheckboxGroup("Матеріал", "material", options.materials)}
            {renderCheckboxGroup("Регулювання потужності", "powerMode", options.powerModes)}
            {renderCheckboxGroup("Тип керування", "controlType", options.controlTypes)}
          </>
        )}

        {/* === КОМПЛЕКТУЮЧІ === */}
        {categorySlug === 'parts' && (
          <>
             {renderCheckboxGroup("Опір (Ом)", "resistance", options.resistances)}
             {renderCheckboxGroup("Об'єм (мл)", "volume", options.volumes)}
          </>
        )}

      </Accordion>
    </Box>
  )
}

export default FilterSidebar